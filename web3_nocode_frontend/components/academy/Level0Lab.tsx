"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  Grid,
  GridItem,
  Text,
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  Badge,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { 
  FaRocket, 
  FaDatabase, 
  FaHistory, 
  FaLayerGroup, 
  FaNetworkWired,
  FaCheckCircle 
} from "react-icons/fa";

import ContractLifecycle from "./ContractLifecycle";
import ContractCodeViewer from "./ContractCodeViewer";
import TransactionFlow from "./TransactionFlow";
import InteractionConsole from "./InteractionConsole";
import TransactionHistory from "./TransactionHistory";

import { API_BASE } from "../../lib/api";

/* =======================
   Types
======================= */
interface TxInfo {
  hash: string;
  type: "deploy" | "write";
  blockNumber: number;
  gasUsed: bigint;
  gasPrice: bigint;
}

interface DeploymentInfo {
  address: string;
  txHash: string;
  blockNumber: number;
}

/* =======================
   MAIN COMPONENT
======================= */
export default function Level0Lab() {
  const toast = useToast();

  // 🔹 États du contrat
  const [abi, setAbi] = useState<any[] | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);

  // 🔹 États pédagogiques
  const [currentMessage, setCurrentMessage] = useState<string>("...");
  const [newMessage, setNewMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<"idle" | "signing" | "broadcast" | "confirmed">("idle");

  // 🔹 Historiques
  const [transactions, setTransactions] = useState<TxInfo[]>([]);
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);

  const colors = {
    bg: "#0A0A0F",
    panel: "rgba(22, 22, 29, 0.8)",
    border: "whiteAlpha.200",
    accent: "#805AD5",
    cardBg: "whiteAlpha.50",
  };

  /* =======================
     🚀 DEPLOY LOGIC
  ======================= */
  const handleDeploy = async (): Promise<void> => {
    if (!window.ethereum) {
      toast({ title: "Wallet non détecté", status: "error" });
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setTxStatus("signing");

      const res = await fetch(`${API_BASE}/deploy/hello-storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network: "anvil",
          initial_message: "Hello World",
          wallet_address: "0x",
        }),
      });

      const data = await res.json();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(data.abi, data.bytecode, signer);

      const deployed = await factory.deploy(...data.constructorArgs);
      setTxStatus("broadcast");

      const deployTx = deployed.deploymentTransaction();
      const receipt = deployTx ? await deployTx.wait() : null;
      const address = await deployed.getAddress();

      const contract = new ethers.Contract(address, data.abi, signer);
      setAbi(data.abi);
      setContractAddress(address);
      setContractInstance(contract);

      const msg = await contract.message();
      setCurrentMessage(msg);
      setTxStatus("confirmed");

      if (receipt && deployTx) {
        setTransactions((prev) => [
          {
            hash: deployTx.hash,
            type: "deploy",
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
            gasPrice: receipt.gasPrice ?? 0n,
          },
          ...prev,
        ]);

        setDeployments((prev) => [{ address, txHash: deployTx.hash, blockNumber: receipt.blockNumber }, ...prev]);
      }

      setTimeout(() => setTxStatus("idle"), 3000);
    } catch (e) {
      console.error(e);
      setTxStatus("idle");
    }
  };

  /* =======================
     ✍️ WRITE LOGIC
  ======================= */
  const handleUpdate = async (): Promise<void> => {
    if (!contractInstance || !newMessage) return;
    setIsProcessing(true);

    try {
      setTxStatus("signing");
      const tx = await contractInstance.setMessage(newMessage);
      setTxStatus("broadcast");

      const receipt = await tx.wait();
      setTxStatus("confirmed");

      setTransactions((prev) => [
        {
          hash: tx.hash,
          type: "write",
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          gasPrice: receipt.gasPrice ?? 0n,
        },
        ...prev,
      ]);

      const msg = await contractInstance.message();
      setCurrentMessage(msg);
      setNewMessage("");
      setTimeout(() => setTxStatus("idle"), 3000);
    } catch (e) {
      console.error(e);
      setTxStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  /* =======================
     🔄 SWITCH INSTANCE
  ======================= */
  const switchInstance = async (d: DeploymentInfo) => {
    if (!window.ethereum || !abi) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(d.address, abi, signer);
      
      setContractAddress(d.address);
      setContractInstance(contract);
      const msg = await contract.message();
      setCurrentMessage(msg);
      
      toast({ title: "Contrat activé", status: "success", duration: 2000 });
    } catch (e) {
      console.error(e);
    }
  };

  const isDeployed = Boolean(contractInstance);

  return (
    <Box bg={colors.bg} minH="100vh" p={{ base: 4, md: 8 }} fontFamily="body">
      <VStack spacing={8} align="stretch" maxW="1440px" mx="auto">
        
        {/* --- HEADER --- */}
        <Box 
          p={6} 
          bg={colors.panel} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor={colors.border}
          backdropFilter="blur(10px)"
        >
          <HStack justify="space-between" mb={8}>
            <VStack align="left" spacing={1}>
              <HStack>
                <Icon as={FaRocket} color="purple.400" />
                <Heading size="md" color="white" fontWeight="900" letterSpacing="tight">
                  LAB 001 : SMART CONTRACT STORAGE
                </Heading>
              </HStack>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">MODULE PÉDAGOGIQUE • RÉSEAU DE TEST</Text>
            </VStack>
            <Badge colorScheme={isDeployed ? "green" : "gray"} variant="subtle" px={3} py={1} borderRadius="full">
              {isDeployed ? "Node connected" : "Not deployed"}
            </Badge>
          </HStack>

          <ContractLifecycle
            contractAddress={contractAddress || undefined}
            txStatus={txStatus}
            colors={colors}
          />
        </Box>

        {/* --- MAIN LAYOUT --- */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={6}>
          
          {/* GAUCHE : Code & Flow */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <VStack spacing={6} align="stretch">
              <Box borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={colors.border} bg="#000">
                <HStack bg="whiteAlpha.100" p={3} px={5} borderBottom="1px solid" borderColor={colors.border} justify="space-between">
                  <HStack spacing={3}>
                    <Icon as={FaDatabase} color="purple.400" />
                    <Text fontSize="xs" fontWeight="black" letterSpacing="widest" color="gray.400">HELLOSTORAGE.SOL</Text>
                  </HStack>
                  <Badge variant="outline" colorScheme="purple" fontSize="10px">Solidity 0.8.19</Badge>
                </HStack>
                <ContractCodeViewer colors={colors} />
              </Box>

              <Box p={6} bg={colors.panel} borderRadius="2xl" border="1px solid" borderColor={colors.border}>
                <HStack mb={4}>
                  <Icon as={FaNetworkWired} color="cyan.400" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.400">SÉQUENCE DE TRANSACTION</Text>
                </HStack>
                <TransactionFlow status={txStatus} />
              </Box>
            </VStack>
          </GridItem>

          {/* DROITE : Console & Deployments */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack spacing={6} align="stretch" position="sticky" top="24px">
              
              <InteractionConsole
                currentMessage={currentMessage}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleUpdate={handleUpdate}
                handleDeploy={handleDeploy}
                isProcessing={isProcessing}
                isDeployed={isDeployed}
                colors={colors}
              />

              {/* Instances de contrats */}
              <Box p={5} bg={colors.panel} borderRadius="2xl" border="1px solid" borderColor={colors.border}>
                <HStack mb={4} justify="space-between">
                  <HStack>
                    <Icon as={FaLayerGroup} color="orange.400" />
                    <Text fontSize="xs" fontWeight="black" color="gray.400">INSTANCES DÉPLOYÉES</Text>
                  </HStack>
                  <Badge borderRadius="full">{deployments.length}</Badge>
                </HStack>
                
                <VStack align="stretch" spacing={3} maxH="320px" overflowY="auto" className="custom-scrollbar">
                  {deployments.length === 0 ? (
                    <Box textAlign="center" py={8} border="1px dashed" borderColor="whiteAlpha.200" borderRadius="xl">
                      <Text fontSize="xs" color="gray.600">Aucun déploiement détecté</Text>
                    </Box>
                  ) : (
                    deployments.map((d, i) => (
                      <Box
                        key={d.txHash}
                        p={4}
                        bg={d.address === contractAddress ? "whiteAlpha.100" : "transparent"}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={d.address === contractAddress ? "purple.500" : "whiteAlpha.100"}
                        cursor="pointer"
                        onClick={() => switchInstance(d)}
                        transition="all 0.2s"
                        _hover={{ bg: "whiteAlpha.50", borderColor: "purple.300" }}
                      >
                        <HStack justify="space-between">
                          <Text fontSize="xs" fontWeight="bold" color={d.address === contractAddress ? "purple.300" : "white"}>
                            Instance #{deployments.length - i}
                          </Text>
                          {d.address === contractAddress && (
                            <Icon as={FaCheckCircle} color="purple.400" boxSize={3} />
                          )}
                        </HStack>
                        <Text fontSize="10px" fontFamily="mono" color="gray.500" mt={2} noOfLines={1}>
                          {d.address}
                        </Text>
                      </Box>
                    ))
                  )}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* --- FOOTER : HISTORY --- */}
        <Box pt={4}>
           <HStack mb={4} spacing={3}>
              <Icon as={FaHistory} color="blue.400" />
              <Text fontSize="sm" fontWeight="black" letterSpacing="widest" color="gray.400">HISTORIQUE DES TRANSACTIONS</Text>
           </HStack>
           <TransactionHistory transactions={transactions} />
        </Box>

      </VStack>
    </Box>
  );
}