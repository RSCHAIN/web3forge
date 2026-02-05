// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NonceAuth {
    address public signer;
    mapping(address => uint256) public nonces;

    event Authenticated(address indexed user, uint256 nonce);

    constructor(address _signer) {
        signer = _signer;
    }

    function auth(uint256 nonce, bytes32 digest, uint8 v, bytes32 r, bytes32 s) external {
        require(nonce == nonces[msg.sender], "wrong nonce");

        // digest = keccak256(abi.encodePacked("AUTH:", msg.sender, nonce));
        address recovered = ecrecover(toEthSignedMessageHash(digest), v, r, s);
        require(recovered == signer, "bad sig");

        nonces[msg.sender] = nonce + 1;
        emit Authenticated(msg.sender, nonce);
    }

    function toEthSignedMessageHash(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
