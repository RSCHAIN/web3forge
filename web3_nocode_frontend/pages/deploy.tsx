"use client";

import { 
  Box, Heading, Text, VStack, Container, Flex, 
  Icon, Button, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  HStack, useColorModeValue
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FiChevronRight, FiPlusSquare, FiShield, FiArrowLeft 
} from "react-icons/fi";
import DeployFormFactory from "../components/deploy/DeployFormFactory";
import ColorModeToggle from "../components/theme/ColorModeToggle";

const MotionBox = motion(Box);

export default function DeployPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isConnected) router.push("/");
  }, [mounted, isConnected, router]);

  // --- COULEURS DYNAMIQUES ---
  const bgMain = useColorModeValue("gray.50", "#050505");
  const textColor = useColorModeValue("gray.900", "white");
  const textMuted = useColorModeValue("gray.600", "whiteAlpha.700");
  const cardBg = useColorModeValue("white", "rgba(255, 255, 255, 0.02)");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const glowOpacity = useColorModeValue("0.08", "0.15");
  const breadcrumbColor = useColorModeValue("gray.500", "whiteAlpha.500");
  const badgeBg = useColorModeValue("green.50", "green.900");
  const badgeText = useColorModeValue("green.600", "green.300");

  if (!mounted || !address) return null;

  return (
    <Box 
      minH="100vh" 
      bg={bgMain} 
      color={textColor} 
      position="relative" 
      overflow="hidden"
      transition="background 0.3s ease"
    >
      
      {/* EFFET DE FOND (Glow subtil adaptatif) */}
      <Box 
        position="absolute" 
        top="-10%" 
        left="50%" 
        transform="translateX(-50%)"
        w="600px" 
        h="400px" 
        bg="purple.500" 
        filter="blur(120px)" 
        opacity={glowOpacity} 
        zIndex="0"
      />

      <Container maxW="container.md" position="relative" zIndex="1" pt={{ base: 6, md: 12 }} pb={20}>
        
        {/* TOP BAR / NAVIGATION */}
        <Flex align="center" mb={10} justify="space-between">
          <Button 
            variant="ghost" 
            color={textMuted} 
            leftIcon={<FiArrowLeft />} 
            _hover={{ color: textColor, bg: useColorModeValue("gray.200", "whiteAlpha.100") }}
            onClick={() => router.push("/dashboard")}
            size="sm"
            borderRadius="full"
          >
            Back to Console
          </Button>
          
          <HStack spacing={4}>
            <Breadcrumb 
              spacing="8px" 
              separator={<FiChevronRight color={breadcrumbColor} />} 
              fontSize="xs" 
              color={breadcrumbColor}
              display={{ base: "none", md: "block" }}
            >
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Console</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href="#" color="purple.500" fontWeight="bold">New Deployment</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <ColorModeToggle />
          </HStack>
        </Flex>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* HEADER DE LA PAGE */}
          <VStack spacing={5} align="flex-start" mb={10}>
            <HStack spacing={4}>
              <Flex 
                p={3} 
                bg="purple.500" 
                borderRadius="2xl" 
                shadow="0 8px 20px rgba(128, 90, 213, 0.3)"
                color="white"
                align="center"
                justify="center"
              >
                <Icon as={FiPlusSquare} boxSize={6} />
              </Flex>
              <Heading size="xl" fontWeight="black" letterSpacing="tight">
                Deploy Contract
              </Heading>
            </HStack>
            
            <Text color={textMuted} fontSize="lg" maxW="lg" lineHeight="tall">
              Select your contract standard and initialize your project on-chain. 
              SafeNet3 handles the security and optimization for you.
            </Text>

            <Flex 
              align="center" 
              color={badgeText} 
              fontSize="xs" 
              fontWeight="bold" 
              bg={badgeBg} 
              px={4} 
              py={1.5} 
              borderRadius="full"
              border="1px solid"
              borderColor={useColorModeValue("green.100", "green.800")}
            >
              <Icon as={FiShield} mr={2} />
              Verified OpenZeppelin Standards
            </Flex>
          </VStack>

          {/* FORMULAIRE DANS UNE CARTE MODERNE */}
          <Box 
            p={{ base: 6, md: 10 }} 
            bg={cardBg} 
            borderRadius="3xl" 
            border="1px solid" 
            borderColor={cardBorder}
            backdropFilter="blur(12px)"
            shadow={useColorModeValue("xl", "2xl")}
          >
            <DeployFormFactory
              userAddress={address}
              onDeployed={() => {
                router.push("/dashboard");
              }}
            />
          </Box>

          {/* FOOTER / TIPS */}
          <VStack mt={12} spacing={2}>
            <Text color={textMuted} fontSize="xs" textAlign="center" fontWeight="medium">
              Gas fees apply for every on-chain deployment. 
              Ensure your wallet is funded on the correct network.
            </Text>
          </VStack>

        </MotionBox>
      </Container>
    </Box>
  );
}