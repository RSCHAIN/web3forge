"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box, Heading, Text, VStack, HStack, Button, Divider,
  Card, Spinner, useToast, Badge, 
  Container, Flex, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Avatar
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { FiLogOut, FiChevronDown, FiUser } from "react-icons/fi";

import { API_BASE } from "../lib/api";
import ConsoleOverview from "../components/dashboard/ConsoleOverview";
import { AcademySidebar } from "../components/dashboard/AcademySidebar";
import Level0Lab from "../components/academy/Level0Lab";
import ColorModeToggle from "../components/theme/ColorModeToggle";

const MotionBox = motion(Box);

export default function Dashboard() {
  const router = useRouter();
  const { address, isConnected, status } = useAccount(); 
  const { disconnect } = useDisconnect();
  const toast = useToast();

  const [mounted, setMounted] = useState(false);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState("anvil");
  const [activeTab, setActiveTab] = useState("overview");
  const [tokenDetails, setTokenDetails] = useState<any>(null);

  // --- STYLES ---
  const bgMain = useColorModeValue("gray.25", "#050508"); 
  const textColor = useColorModeValue("gray.900", "white");
  const cardBg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  useEffect(() => { setMounted(true); }, []);

  // Redirection si déconnecté
  useEffect(() => {
    if (mounted && status !== 'connecting' && status !== 'reconnecting' && !isConnected) {
      router.replace("/");
    }
  }, [mounted, isConnected, status, router]);

  const fetchDashboard = async () => {
    if (!address) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/deploy/byUser/${address}${network !== "anvil" ? `?network=${network}` : ""}`, { credentials: "include" });
      const data = await res.json();
      setDeployments(data.deployments || []);
    } catch (err) {
      toast({ title: "Sync Error", status: "error" });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (mounted && address && isConnected) fetchDashboard();
  }, [mounted, address, isConnected, network]);

  const currentContract = useMemo(() => 
    deployments.find(d => d.contract_address === activeTab || (activeTab === "lvl0" && d.name === "HelloStorage")), 
  [deployments, activeTab]);

  // Formatage de l'adresse pour le bouton
  const shortAddress = useMemo(() => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "", [address]);

  if (!mounted || status === 'connecting') {
    return (
      <Flex h="100vh" w="100vw" align="center" justify="center" bg="#050508">
        <Spinner color="purple.500" size="xl" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={bgMain} display="flex">
      <AcademySidebar 
        deployments={deployments} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        loading={loading} 
        tokenDetails={tokenDetails} 
        disconnect={disconnect} 
      />

      <Box flex="1" p={{ base: 4, md: 8 }} overflowY="auto">
        <Container maxW="container.xl">
          
          {/* --- TOP HEADER BAR --- */}
          <Flex justify="space-between" align="center" mb={10}>
            <VStack align="flex-start" spacing={0}>
              <HStack>
                <Heading size="lg" fontWeight="900" color={textColor}>
                    {activeTab === "overview" ? "Academy Dashboard" : "Forensic Console"}
                </Heading>
                <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3}>Academy Mode</Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">Node: {network.toUpperCase()}</Text>
            </VStack>

            <HStack spacing={4}>
              <ColorModeToggle />
              
              {/* Menu de l'utilisateur / Déconnexion */}
              <Menu>
                <MenuButton 
                  as={Button} 
                  variant="outline" 
                  rightIcon={<FiChevronDown />} 
                  borderColor={borderColor}
                  bg={cardBg}
                  _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
                  borderRadius="xl"
                  px={4}
                >
                  <HStack spacing={3}>
                    <Avatar size="xs" name={address} src={`https://effigy.im/a/${address}.svg`} />
                    <Text fontSize="sm" fontWeight="bold" fontFamily="mono">
                      {shortAddress}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList bg={useColorModeValue("white", "#0A0A0F")} borderColor={borderColor} p={2} borderRadius="xl" boxShadow="2xl">
                  <MenuItem icon={<FiUser />} borderRadius="lg" fontSize="sm">
                    Mon Profil
                  </MenuItem>
                  <Divider my={2} />
                  <MenuItem 
                    icon={<FiLogOut />} 
                    color="red.400" 
                    borderRadius="lg" 
                    fontSize="sm"
                    fontWeight="bold"
                    onClick={() => {
                      disconnect();
                      router.push("/");
                    }}
                  >
                    Déconnecter le Wallet
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <ConsoleOverview address={address!} deploymentsCount={deployments.length} network={network} />
            ) : activeTab === "lvl0" ? (
              <MotionBox key="lvl0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Level0Lab 
                  connectedAddress={address} 
                  isConnected={isConnected} 
                />
              </MotionBox>
            ) : currentContract && (
              <MotionBox key="contract" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                 {/* Vue standard InteractionPanel ici */}
              </MotionBox>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
}