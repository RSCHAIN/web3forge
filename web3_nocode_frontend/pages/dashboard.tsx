"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box, Heading, Text, VStack, HStack, Button, Divider,
  Card, Spinner, useToast, Select, SimpleGrid, Badge, Icon,
  Container, Flex, IconButton, Switch, FormControl, FormLabel,
  Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { ethers } from "ethers";
import { FiHash } from "react-icons/fi";

import { API_BASE } from "../lib/api";
import ERC20Transactions from "../components/contracts/ERC20Transactions";
import { TransactionMasteryHeader } from "../components/contracts/TransactionMasteryHeader";
import InteractionPanel from "../components/InteractionPanel";
import ConsoleOverview from "../components/dashboard/ConsoleOverview";
import { AcademySidebar } from "../components/dashboard/AcademySidebar";
import Level0Lab from "../components/academy/Level0Lab";

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
  const [viewMode, setViewMode] = useState<"pro" | "edu">("edu");
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const bgMain = useColorModeValue("gray.25", "#050508"); 
  const headerBg = useColorModeValue("white", "whiteAlpha.100");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.900", "white");

  useEffect(() => { setMounted(true); }, []);

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

      <Box flex="1" p={8} overflowY="auto">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" mb={10}>
            <VStack align="flex-start" spacing={0}>
              <HStack>
                <Heading size="lg" fontWeight="900" color={textColor}>
                    {activeTab === "overview" ? "Academy Dashboard" : "Forensic Console"}
                </Heading>
                <Badge colorScheme="purple">Academy Mode</Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Node: {network.toUpperCase()}</Text>
            </VStack>
          </Flex>

          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <ConsoleOverview address={address!} deploymentsCount={deployments.length} network={network} />
            ) : activeTab === "lvl0" ? (
              <MotionBox key="lvl0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* 🚀 On affiche Level0Lab sans condition, c'est lui qui gère son état interne */}
                <Level0Lab 
                  contractAddress={currentContract?.contract_address} 
                  abi={currentContract?.abi}
                  onDeploySuccess={fetchDashboard}
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