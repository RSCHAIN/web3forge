"use client";
import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Image,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useChainId,
} from "wagmi";
import { injected } from "wagmi/connectors";

const MotionBox = motion(Box);

export default function AuthPage() {
  const router = useRouter();
  const toast = useToast();

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // 🧠 Redirige vers le dashboard si déjà connecté
  useEffect(() => {
    if (authenticated) router.push("/dashboard");
  }, [authenticated, router]);

  // ✅ Fonction principale de connexion SIWE
  async function handleLogin() {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Récupérer le nonce depuis le backend
      const res = await fetch("http://localhost:8000/auth/siwe/nonce");
      const { nonce } = await res.json();

      // 2️⃣ Construire le message à signer
      const domain = window.location.host;
      const uri = window.location.origin;
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        `${address}`,
        "",
        `Sign in to SafeNet3`,
        `URI: ${uri}`,
        `Version: 1`,
        `Chain ID: ${chainId}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join("\n");

      // 3️⃣ Signature via MetaMask
      const signature = await signMessageAsync({
        account: address as `0x${string}`,
        message,
      });

      // 4️⃣ Vérification backend
      const verifyRes = await fetch("http://localhost:8000/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) throw new Error("SIWE verification failed");

      const data = await verifyRes.json();
      toast({
        title: "✅ Logged in successfully",
        description: `Welcome back, ${data.address.slice(0, 6)}...${data.address.slice(-4)}`,
        status: "success",
        duration: 4000,
      });

      setAuthenticated(true);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Login failed",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MotionBox
      minH="100vh"
      bgGradient="linear(to-br, gray.900, gray.800, purple.900)"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      textAlign="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <VStack spacing={8} w="full" maxW="md" p={8} borderRadius="2xl" bg="gray.800" shadow="2xl">
        <Image src="/logo.jpeg" alt="SafeNet3" boxSize="80px" />
        <Heading fontSize="2xl" bgGradient="linear(to-r, cyan.400, purple.400)" bgClip="text">
          SafeNet3 Login
        </Heading>
        <Text color="gray.400" fontSize="md">
          Secure your access with <b>Sign-In with Ethereum</b>.
        </Text>

        {!isConnected ? (
          <Button colorScheme="purple" size="lg" w="full" onClick={() => connect({ connector: injected() })}>
            🔗 Connect MetaMask
          </Button>
        ) : (
          <VStack w="full" spacing={3}>
            <Text fontSize="sm" color="gray.400">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </Text>
            <Button
              colorScheme="teal"
              size="lg"
              w="full"
              onClick={handleLogin}
              isLoading={loading}
              loadingText="Authenticating..."
            >
              🔐 Sign In with Ethereum
            </Button>
            <Button
              variant="outline"
              colorScheme="red"
              size="sm"
              onClick={() => {
                disconnect();
                toast({
                  title: "Disconnected",
                  description: "Wallet disconnected successfully.",
                  status: "info",
                });
              }}
            >
              Disconnect
            </Button>
          </VStack>
        )}
      </VStack>

      <HStack mt={10}>
        <Text fontSize="sm" color="gray.500">
          © 2025 SafeNet3 — Secure decentralized access.
        </Text>
      </HStack>
    </MotionBox>
  );
}
