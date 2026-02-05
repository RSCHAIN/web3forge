"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, Text, VStack, Heading, HStack, Flex, Container,
  SimpleGrid, Icon, Divider, useToast, Badge, useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useAccount, useConnect, useDisconnect, useSignMessage, useChainId,
} from "wagmi";
import { injected } from "wagmi/connectors";
import {
  FiShield, FiCpu, FiGlobe, FiLayers, FiArrowRight, FiCheckCircle
} from "react-icons/fi";
import { API_BASE } from "../lib/api";
import ColorModeToggle from "../components/theme/ColorModeToggle";

const MotionBox = motion(Box);

export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

  const [me, setMe] = useState<any>(null);

  // --- COULEURS DYNAMIQUES (Light/Dark Mode) ---
  const bgMain = useColorModeValue("gray.50", "#050505");
  const textColor = useColorModeValue("gray.900", "white");
  const textMuted = useColorModeValue("gray.600", "whiteAlpha.700");
  const cardBg = useColorModeValue("white", "rgba(255, 255, 255, 0.02)");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const btnPrimaryBg = useColorModeValue("purple.600", "white");
  const btnPrimaryText = useColorModeValue("white", "black");
  const glowOpacity = useColorModeValue("0.08", "0.2");

  async function loginSIWE() {
    try {
      const res = await fetch(`${API_BASE}/auth/siwe/nonce`);
      const { nonce } = await res.json();
      const message = [
        `${window.location.host} wants you to sign in with your Ethereum account:`,
        address, "", "Sign in to SafeNet3",
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
      toast({ title: "Authenticated", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message, status: "error" });
    }
  }

  return (
    <Box minH="100vh" bg={bgMain} color={textColor} overflow="hidden" position="relative" transition="background 0.3s ease">
      
      {/* BACKGROUND GLOWS (S'adaptent à l'opacité du mode choisi) */}
      <Box position="absolute" top="-150px" left="-100px" w="500px" h="500px" bg="purple.500" filter="blur(150px)" opacity={glowOpacity} zIndex="0" />
      <Box position="absolute" bottom="-150px" right="-100px" w="500px" h="500px" bg="blue.500" filter="blur(150px)" opacity={glowOpacity} zIndex="0" />

      {/* HEADER */}
      <Flex px={{ base: 6, md: 12 }} py={6} justify="space-between" align="center" position="relative" zIndex="10">
        <HStack spacing={3}>
          <Icon as={FiShield} boxSize={8} color="purple.500" filter="drop-shadow(0 0 8px rgba(159, 122, 234, 0.3))" />
          <Heading size="md" fontWeight="black" letterSpacing="tighter">SafeNet3</Heading>
        </HStack>

        <HStack spacing={4}>
          <ColorModeToggle />
          
          {!isConnected ? (
            <Button 
              leftIcon={<FiGlobe />} 
              variant="solid" 
              bg={btnPrimaryBg} 
              color={btnPrimaryText} 
              _hover={{ opacity: 0.9, transform: "translateY(-1px)" }} 
              borderRadius="full" 
              onClick={() => connect({ connector: injected() })}
            >
              Connect Wallet
            </Button>
          ) : !me ? (
            <Button colorScheme="purple" borderRadius="full" px={8} onClick={loginSIWE} boxShadow="0 4px 15px rgba(159, 122, 234, 0.3)">
              Sign In
            </Button>
          ) : (
            <HStack bg={cardBg} py={1} px={4} borderRadius="full" border="1px solid" borderColor={cardBorder}>
              <Text fontSize="xs" fontWeight="bold" fontFamily="mono" color="purple.500">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Text>
              <Divider orientation="vertical" h="12px" borderColor={cardBorder} />
              <Button size="xs" variant="ghost" color="red.500" onClick={() => disconnect()}>
                Exit
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* HERO SECTION */}
      <Container maxW="container.lg" pt={{ base: 20, md: 32 }} pb={20} position="relative" zIndex="1">
        <VStack spacing={8} textAlign="center">
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={4} py={1} mb={6}>
              ✨ No-Code Smart Contract Platform
            </Badge>
            <Heading size="3xl" fontWeight="black" lineHeight="1.1" letterSpacing="tight">
              Build & Deploy <br />
              <Text as="span" bgGradient="linear(to-r, purple.500, blue.400)" bgClip="text">
                Web3 Assets Safely
              </Text>
            </Heading>
          </MotionBox>

          <Text fontSize={{ base: "lg", md: "xl" }} color={textMuted} maxW="2xl" lineHeight="tall">
            SafeNet3 is the enterprise-grade console for blockchain deployments. 
            Launch audited tokens and NFTs across 15+ networks instantly.
          </Text>

          <HStack spacing={6} pt={4}>
            <Button
              size="lg"
              bg={btnPrimaryBg}
              color={btnPrimaryText}
              px={10}
              h="60px"
              borderRadius="full"
              rightIcon={<FiArrowRight />}
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              onClick={() => router.push("/dashboard")}
              isDisabled={!me}
            >
              Console
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor={cardBorder}
              px={10}
              h="60px"
              borderRadius="full"
              _hover={{ bg: cardBg }}
              onClick={() => router.push("/deploy")}
              isDisabled={!me}
            >
              New Deploy
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* FEATURE GRID */}
      <Container maxW="container.xl" pb={32}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          <FeatureCard 
            bg={cardBg}
            borderColor={cardBorder}
            icon={FiCpu} 
            title="Zero Code" 
            text="Production-ready Solidity contracts without writing a single line of code." 
          />
          <FeatureCard 
            bg={cardBg}
            borderColor={cardBorder}
            icon={FiLayers} 
            title="Multi-Standard" 
            text="Support for ERC20 tokens, NFTs, and custom governance modules." 
          />
          <FeatureCard 
            bg={cardBg}
            borderColor={cardBorder}
            icon={FiGlobe} 
            title="Any Network" 
            text="Deploy from local Anvil to Ethereum Mainnet and Layer 2s." 
          />
          <FeatureCard 
            bg={cardBg}
            borderColor={cardBorder}
            icon={FiCheckCircle} 
            title="Audit-Ready" 
            text="Security-first architecture using OpenZeppelin audited standards." 
          />
        </SimpleGrid>
      </Container>

      <Divider borderColor={cardBorder} />

      {/* FOOTER */}
      <Box py={10} textAlign="center">
        <Text fontSize="xs" color={textMuted} fontWeight="bold" letterSpacing="widest">
          © 2026 SAFENET3 PROTOCOL • SECURE WEB3 DEPLOYMENT
        </Text>
      </Box>
    </Box>
  );
}

function FeatureCard({ icon, title, text, bg, borderColor }: any) {
  const iconBg = useColorModeValue("purple.50", "purple.900");
  const iconColor = useColorModeValue("purple.600", "purple.200");

  return (
    <MotionBox
      whileHover={{ y: -5 }}
      p={8}
      bg={bg}
      borderRadius="3xl"
      border="1px solid"
      borderColor={borderColor}
      transition="0.3s"
      boxShadow={useColorModeValue("sm", "none")}
    >
      <Flex 
        w="50px" h="50px" 
        bg={iconBg} 
        borderRadius="2xl" 
        align="center" 
        justify="center" 
        mb={6}
        color={iconColor}
      >
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Heading size="sm" mb={3} fontWeight="bold">{title}</Heading>
      <Text fontSize="sm" color={useColorModeValue("gray.600", "whiteAlpha.600")} lineHeight="tall">
        {text}
      </Text>
    </MotionBox>
  );
}