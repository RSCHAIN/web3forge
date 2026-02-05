from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from eth_account import Account
from eth_account.messages import encode_defunct
from jose import jwt, JWTError
import secrets, re, os
from app.db.models.user import User
from app.db.models.auth_model import VerifyPayload

router = APIRouter()
# --- stockages temporaires ---
NONCES = set()


# --- Configs ---
APP_DOMAIN = os.getenv("APP_DOMAIN", "localhost:3000")
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ISS = "nocode-web3"
JWT_EXP_MIN = 60


# --- Helpers ---
def set_session_cookie(resp: Response, token: str):
    resp.set_cookie(
    key="session",
    value=token,
    httponly=True,
    secure=False,      # ⚠️ mettre True en prod
    samesite="lax",
    max_age=JWT_EXP_MIN * 60,
    path="/",
)


def parse_siwe(msg: str):
    domain_line, addr_line = msg.splitlines()[0], msg.splitlines()[1]
    m_domain = re.match(r"^(.+?) wants you to sign in with your Ethereum account:", domain_line.strip())
    domain = m_domain.group(1).strip() if m_domain else ""
    address = addr_line.strip()
    fields = {}
    for line in msg.splitlines():
        if line.startswith("URI:"):
            fields["uri"] = line.split("URI:")[1].strip()
        elif line.startswith("Version:"):
            fields["version"] = line.split("Version:")[1].strip()
        elif line.startswith("Chain ID:"):
            fields["chainId"] = int(line.split("Chain ID:")[1].strip())
        elif line.startswith("Nonce:"):
            fields["nonce"] = line.split("Nonce:")[1].strip()
        elif line.startswith("Issued At:"):
            fields["issuedAt"] = line.split("Issued At:")[1].strip()
        elif line.startswith("Expiration Time:"):
            fields["expirationTime"] = line.split("Expiration Time:")[1].strip()
    return {"domain": domain, "address": address, **fields}

def make_jwt(sub: str, addr: str):
    now = datetime.now(timezone.utc)
    payload = {
        "iss": JWT_ISS,
        "sub": sub,
        "addr": addr,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXP_MIN)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def require_auth(req: Request):
    token = req.cookies.get("session")
    if not token:
        raise HTTPException(status_code=401, detail="No session")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"require": ["exp", "iat", "sub"]})
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")
    return payload

# --- Routes ---

@router.get("/siwe/nonce")
async def get_nonce():
    n = secrets.token_urlsafe(12)
    NONCES.add(n)
    return {"nonce": n}

@router.post("/siwe/verify")
async def verify(p: VerifyPayload, response: Response):
    msg, sig = p.message, p.signature
    siwe = parse_siwe(msg)

    # 1️⃣ Validation du message
    if siwe["domain"] != APP_DOMAIN:
        raise HTTPException(400, f"Bad domain: {siwe['domain']}")
    if "nonce" not in siwe or siwe["nonce"] not in NONCES:
        raise HTTPException(400, "Nonce invalid/used")
    NONCES.discard(siwe["nonce"])

    # 2️⃣ Vérification de la signature
    recovered = Account.recover_message(encode_defunct(text=msg), signature=sig)
    if recovered.lower() != siwe["address"].lower():
        raise HTTPException(400, "Signature mismatch")

    # 3️⃣ Recherche ou création utilisateur dans MongoDB
    addr = recovered.lower()
    user = await User.find_one(User.siwe_address == addr)

    if user:
        user.last_login = datetime.utcnow()
        await user.save()
    else:
        user = User(siwe_address=addr)
        await user.insert()

    # 4️⃣ Création du JWT
    token = make_jwt(sub=str(user.id), addr=addr)
    set_session_cookie(response, token)

    return {"ok": True, "address": addr, "user_id": user.id}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session", path="/")
    return {"ok": True}

@router.get("/me")
async def me(payload = Depends(require_auth)):
    addr = payload["addr"]
    user = await User.find_one(User.siwe_address == addr)

    if not user:
        raise HTTPException(404, "Utilisateur non trouvé en base")

    return {
        "address": addr,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "plan": user.plan,
            "created_at": user.created_at.isoformat()
        },
        "exp": payload["exp"]
    }


