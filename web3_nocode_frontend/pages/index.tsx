"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, Text, VStack, Heading, HStack, Flex, Container,
  SimpleGrid, Icon, Divider, useToast, Badge, useColorModeValue, Image
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useAccount, useConnect, useDisconnect, useSignMessage, useChainId,
} from "wagmi";
import { injected } from "wagmi/connectors";
import {
  FiShield, FiCpu, FiGlobe, FiLayers, FiArrowRight, FiActivity, FiBookOpen, FiZap, FiSearch
} from "react-icons/fi";
import { API_BASE } from "../lib/api";
import ColorModeToggle from "../components/theme/ColorModeToggle";

const MotionBox = motion(Box);

interface User {
  address: string;
  isAdmin?: boolean;
}

export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // --- PERSISTANCE DE SESSION ---
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setMe(data);
        }
      } catch (err) {
        console.log("No active session");
      }
    }
    checkSession();
  }, []);

  async function loginSIWE() {
    if (!address) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/siwe/nonce`);
      const { nonce } = await res.json();
      const message = [
        `${window.location.host} wants you to sign in with your Ethereum account:`,
        address, "", "Sign in to Web3Forge Labs",
        `URI: ${window.location.origin}`, "Version: 1",
        `Chain ID: ${chainId}`, `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join("\n");

      const signature = await signMessageAsync({ account: address as `0x${string}`, message });
      const verifyRes = await fetch(`${API_BASE}/auth/siwe/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) throw new Error("SIWE verification failed");
      const data = await verifyRes.json();
      setMe(data);
      toast({ title: "Welcome to the Lab", status: "success" });
      router.push("/dashboard");
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }

  // --- STYLES ---
  const bgMain = useColorModeValue("gray.50", "#050508");
  const textColor = useColorModeValue("gray.900", "white");
  const textMuted = useColorModeValue("gray.600", "gray.500");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const glowOpacity = useColorModeValue("0.05", "0.15");

  return (
    <Box minH="100vh" bg={bgMain} color={textColor} position="relative" overflowX="hidden">
      
      {/* ATMOSPHERIC GLOWS */}
      <Box position="absolute" top="-10%" left="-10%" w="70%" h="70%" bgGradient="radial(purple.500, transparent 70%)" opacity={glowOpacity} zIndex="0" pointerEvents="none" />

      {/* NAVBAR */}
      <Flex px={{ base: 6, md: 10 }} py={6} justify="space-between" align="center" position="relative" zIndex="10" backdropFilter="blur(12px)">
        <HStack spacing={4}>
          <Image src="/logo.jpeg" alt="Logo" boxSize="40px" borderRadius="md" />
          <VStack align="flex-start" spacing={0}>
            <Heading size="sm" fontWeight="900" letterSpacing="widest">WEB3FORGE</Heading>
            <Text fontSize="9px" fontWeight="black" color="purple.500" letterSpacing="0.2em">LABS & RESEARCH</Text>
          </VStack>
        </HStack>

        <HStack spacing={5}>
          <ColorModeToggle />
          {!isConnected ? (
            <Button size="sm" colorScheme="purple" borderRadius="full" px={6} onClick={() => connect({ connector: injected() })}>
              Connect Wallet
            </Button>
          ) : (
            <Button size="sm" colorScheme="purple" borderRadius="full" px={6} isLoading={loading} onClick={!me ? loginSIWE : () => router.push("/dashboard")}>
              {me ? "Open Console" : "Sign In"}
            </Button>
          )}
        </HStack>
      </Flex>

      {/* HERO SECTION */}
      <Container maxW="6xl" pt={{ base: 20, md: 32 }} pb={20} position="relative" zIndex="1">
        <VStack spacing={8} textAlign="center">
          <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={4} py={1}>
            v2.0 : Engineering Secure Decentralization
          </Badge>
          <Heading size="4xl" fontWeight="900" lineHeight="1" letterSpacing="tighter">
            Learn Web3. <br />
            Build securely. <br />
            <Text as="span" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text">
              Deploy without code.
            </Text>
          </Heading>
          <Text fontSize="xl" color={textMuted} maxW="2xl" fontWeight="medium">
            Web3Forge Labs is a specialized environment for blockchain architects. 
            From novice training to professional deployment.
          </Text>
          <Button size="lg" colorScheme="purple" px={10} h="64px" borderRadius="2xl" rightIcon={<FiZap fill="currentColor" />} onClick={!me ? loginSIWE : () => router.push("/dashboard")} isDisabled={!isConnected}>
            Launch Console
          </Button>
        </VStack>
      </Container>

      {/* THE THREE PATHS */}
      <Container maxW="7xl" pb={32} position="relative" zIndex="1">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <PathwayCard 
            title="The Academy"
            level="Learning Hub"
            desc="Deep dive into EVM internals. Understand gas optimization and security through forensic log analysis."
            icon={FiBookOpen}
            accentColor="blue.400"
            action="Start Learning"
            path="/dashboard"
          />
          <PathwayCard 
            title="The Forge"
            level="Pro Deployment"
            desc="No-code engine for production-grade tokens & vaults. Real-time monitoring and multi-chain management."
            icon={FiCpu}
            accentColor="purple.400"
            action="Launch Forge"
            path="/dashboard"
          />
          <PathwayCard 
            title="The Archive"
            level="Research Hub"
            desc="A library of new security protocols and technical articles. Explore next-gen smart contract patterns."
            icon={FiSearch}
            accentColor="orange.400"
            action="Browse Archive"
            path="/archive"
          />
        </SimpleGrid>
      </Container>

      <Divider borderColor={cardBorder} />
      <Box py={10} textAlign="center">
        <Text fontSize="xs" color="gray.600" fontWeight="black" letterSpacing="0.4em">
           WEB3FORGE LABS — SECURE BY DESIGN — {new Date().getFullYear()}
        </Text>
      </Box>
    </Box>
  );
}

function PathwayCard({ title, level, desc, icon, accentColor, action, path }: any) {
  const router = useRouter();
  return (
    <Box 
      p={10} bg={useColorModeValue("white", "rgba(255,255,255,0.02)")} borderRadius="3xl" border="1px solid" 
      borderColor={useColorModeValue("gray.200", "whiteAlpha.100")} transition="all 0.3s"
      _hover={{ transform: "translateY(-8px)", borderColor: accentColor }}
      cursor="pointer" onClick={() => router.push(path)}
    >
      <VStack align="flex-start" spacing={5}>
        <Badge colorScheme={accentColor.split('.')[0]} variant="subtle">{level}</Badge>
        <Icon as={icon} boxSize={8} color={accentColor} />
        <Heading size="md" fontWeight="900">{title}</Heading>
        <Text fontSize="sm" color="gray.500" lineHeight="tall">{desc}</Text>
        <Button variant="link" color={accentColor} rightIcon={<FiArrowRight />}>{action}</Button>
      </VStack>
    </Box>
  );
}