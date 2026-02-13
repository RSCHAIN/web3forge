"use client";

import { useState, useEffect, useCallback } from "react";
import {
  VStack,
  Grid,
  GridItem,
  Text,
  Box,
  Heading,
  Icon,
  Badge,
  useToast,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import {
  FaRocket,
  FaDatabase,
  FaHistory,
  FaLayerGroup,
  FaNetworkWired,
  FaCheckCircle,
} from "react-icons/fa";

import ContractLifecycle from "./ContractLifecycle";
import ContractCodeViewer from "./ContractCodeViewer";
import TransactionFlow from "./TransactionFlow";
import InteractionConsole from "./InteractionConsole";
import TransactionHistory from "./TransactionHistory";
import BlockchainVisualizer from "../BlockchainVisualizer";

import MiningControls from "../MiningControls";
import BlockchainControlPanel from "../BlockchainControlPanel";

import { useBlockchainMining } from "../../hooks/useBlockchainMining";
import { useMempool } from "../../hooks/useMempool";
import { useBlockTimer } from "../../hooks/useBlockTimer";

import { API_BASE } from "../../lib/api";
import { TxInfo, DeploymentInfo } from "../types/txinfo";
import { getNetworkLabel, isTestNetwork } from "../../lib/getprovider";

import ContractInstancesPanel from "../ContractInstancesPanel"; // ajuste chemin
import ContractEventsPanel from "../ContractEventsPanel";



interface Level0LabProps {
  connectedAddress?: string;
  isConnected?: boolean;
}
type LabColors = {
  panel: string;
  border: string;
  accent: string;
};


export default function Level0Lab({
  connectedAddress,
  isConnected,
}: Level0LabProps) {
  const toast = useToast();

  // 🎨 UI
  const bgColor = useColorModeValue("gray.50", "#0A0A0F");
  const panelBg = useColorModeValue("white", "rgba(22, 22, 29, 0.8)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.500");

  // 🧠 Hooks blockchain
  const mining = useBlockchainMining();
  const mempool = useMempool();
  const timer = useBlockTimer();

  // 🔹 États Smart Contract
  const [abi, setAbi] = useState<ethers.Interface | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [contractInstance, setContractInstance] =
    useState<ethers.Contract | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>("...");
  const [newMessage, setNewMessage] = useState<string>("");
  const [txStatus, setTxStatus] = useState<
    "idle" | "signing" | "broadcast" | "confirmed"
  >("idle");

  const [transactions, setTransactions] = useState<TxInfo[]>([]);
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);


  

  // =====================================================
  // 🔍 FETCH BLOCKCHAIN DATA
  // =====================================================

  const colors: LabColors = {
  panel: panelBg,
  border: borderColor,
  accent: "#805AD5",
};


  const fetchUserDeployments = useCallback(async () => {
  if (!connectedAddress || !window.ethereum) return;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const networkLabel = getNetworkLabel(network.chainId);

    const res = await fetch(
      `${API_BASE}/deploy/byUser/${connectedAddress}?network=${networkLabel}`
    );
    const data = await res.json();
    const records: DeploymentInfo[] = data.deployments || [];

    // 🔎 Vérification réelle sur la blockchain
    const validDeployments: DeploymentInfo[] = [];

    for (const deployment of records) {
      try {
        const code = await provider.getCode(deployment.contract_address);

        if (code && code !== "0x" && code !== "0x0") {
          validDeployments.push(deployment);
        }
      } catch {
        // ignore silently
      }
    }

    setDeployments(validDeployments);

    // -----------------------------
    // 🔄 SCAN DES BLOCS (inchangé)
    // -----------------------------

    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(1, currentBlock - 9);

    const history: TxInfo[] = [];

    for (let i = startBlock; i <= currentBlock; i++) {
      const block = await provider.getBlock(i, true);
      if (!block) continue;

      const timestamp = Number(block.timestamp);

      if (!block.transactions.length) {
        history.push({
          hash: `empty-${i}`,
          type: "empty",
          blockNumber: i,
          timestamp,
          from: "System",
          gasUsed: 0n,
          gasPrice: 0n,
          value: 0n,
          nonce: 0,
          status: "success",
        });
        continue;
      }

      for (const txHash of block.transactions as string[]) {
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!tx || !receipt) continue;

        const isDeploy = !!receipt.contractAddress;

        history.push({
          hash: tx.hash,
          type: isDeploy ? "deploy" : "write",
          blockNumber: i,
          timestamp,
          gasUsed: receipt.gasUsed ?? 0n,
          gasPrice: tx.gasPrice ?? tx.maxFeePerGas ?? 0n,
          from: tx.from ?? "0x...",
          to: tx.to ?? undefined,
          value: tx.value ?? 0n,
          nonce: tx.nonce ?? 0,
          status: receipt.status === 1 ? "success" : "failed",
        });
      }
    }

    setTransactions(history.sort((a, b) => b.blockNumber - a.blockNumber));
  } catch (error) {
    console.error("Erreur fetch deployments:", error);
  }
}, [connectedAddress]);


  useEffect(() => {
    if (isConnected && connectedAddress) {
      fetchUserDeployments();
    }
  }, [isConnected, connectedAddress, fetchUserDeployments]);

  

  const handleSelectInstance = useCallback(
  async (deployment: DeploymentInfo) => {
    if (!window.ethereum) return;

    try {
      setIsProcessing(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Vérifie existence du bytecode
      const code = await provider.getCode(deployment.contract_address);
      if (code === "0x" || code === "0x0") {
        toast({
          title: "Instance introuvable",
          description:
            "Le contrat n'existe pas sur ce réseau (Anvil peut avoir redémarré).",
          status: "warning",
        });
        return;
      }

      // ABI : priorité à l'ABI stockée dans la DB (deployment.abi) sinon fallback sur state
      const effectiveAbi = (deployment.abi as any) ?? abi;

      if (!effectiveAbi) {
        toast({
          title: "ABI manquante",
          description:
            "Impossible de charger cette instance sans ABI. Assure-toi que l'ABI est bien enregistrée.",
          status: "error",
        });
        return;
      }

      // Init contract instance
      const instance = new ethers.Contract(
        deployment.contract_address,
        effectiveAbi,
        signer
      );

      setAbi(effectiveAbi);
      setContractAddress(deployment.contract_address);
      setContractInstance(instance);

      // Lecture message() si dispo
      try {
        const msg = await instance.message();
        setCurrentMessage(msg);
      } catch {
        setCurrentMessage("—");
      }

      toast({
        title: "Instance chargée",
        description: deployment.contract_address,
        status: "success",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur de chargement",
        status: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  },
  [abi, toast]
);


  // =====================================================
  // 🚀 DEPLOY
  // =====================================================

  const handleDeploy = async () => {
  if (!window.ethereum) return;

  try {
    setTxStatus("signing");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    if (!isTestNetwork(network.chainId)) {
      toast({
        title: "Réseau non autorisé",
        status: "error",
      });
      setTxStatus("idle");
      return;
    }

    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const networkLabel = getNetworkLabel(network.chainId);

    // 🔥 ON RÉCUPÈRE ABI + BYTECODE DEPUIS TON BACKEND
    const res = await fetch(`${API_BASE}/deploy/hello-storage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network: networkLabel,
        initial_message: "Hello World",
        wallet_address: userAddress,
      }),
    });

    if (!res.ok) throw new Error("Erreur compilation");

    const data = await res.json();

    const factory = new ethers.ContractFactory(
      data.abi,
      data.bytecode,
      signer
    );

    const deployed = await factory.deploy(...data.constructorArgs);

    setTxStatus("broadcast");

    const receipt = await deployed.deploymentTransaction()?.wait();
    if (!receipt) throw new Error("Deploy failed");

    const address = await deployed.getAddress();

    const instance = new ethers.Contract(address, data.abi, signer);

    setAbi(data.abi);
    setContractAddress(address);
    setContractInstance(instance);

    const msg = await instance.message();
    setCurrentMessage(msg);

    setTxStatus("confirmed");

    toast({
      title: "Déploiement réussi",
      status: "success",
    });

    await fetchUserDeployments();

  } catch (error) {
    console.error(error);
    setTxStatus("idle");
    toast({
      title: "Erreur de déploiement",
      status: "error",
    });
  }
};


  const isDeployed = Boolean(contractInstance);

  const [isProcessing, setIsProcessing] = useState(false);

const handleUpdate = async (): Promise<void> => {
  if (!contractInstance || !newMessage) return;

  try {
    setIsProcessing(true);
    setTxStatus("signing");

    const tx = await contractInstance.setMessage(newMessage);
    setTxStatus("broadcast");

    await tx.wait();

    // 🔥 RELIRE LA VALEUR SUR LA BLOCKCHAIN
    const updatedMessage = await contractInstance.message();
    setCurrentMessage(updatedMessage);
    console.log("Contract Address used for update:", contractAddress);
    console.log("Contract Instance address:", await contractInstance.getAddress());


    setNewMessage("");
    setTxStatus("confirmed");

    await fetchUserDeployments(); // pour historique

  } catch (error) {
    console.error(error);
    setTxStatus("idle");
  } finally {
    setIsProcessing(false);
  }
};


useEffect(() => {
  const loadMessage = async () => {
    if (!contractInstance) return;

    try {
      const msg = await contractInstance.message();
      setCurrentMessage(msg);
    } catch {
      setCurrentMessage("—");
    }
  };

  loadMessage();
}, [contractInstance]);



  // =====================================================
  // 🖥 UI
  // =====================================================

  return (
    <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 8 }}>
      <VStack spacing={8} align="stretch" maxW="1440px" mx="auto">
        {/* HEADER */}
        <Box
          p={6}
          bg={panelBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack justify="space-between">
            <HStack>
              <Icon as={FaRocket} color="purple.500" />
              <Heading size="md" color={textColor}>
                LAB 001 : SMART CONTRACT STORAGE
              </Heading>
            </HStack>

            <Badge colorScheme={isDeployed ? "green" : "gray"}>
              {isDeployed ? "Connected" : "Disconnected"}
            </Badge>
          </HStack>

          <ContractLifecycle
            contractAddress={contractAddress || undefined}
            txStatus={txStatus}
            colors={colors}
          />
        </Box>

        {/* MAIN GRID */}
        <Grid templateColumns={{ base: "1fr", lg: "8fr 4fr" }} gap={6}>
          <GridItem>
            <ContractCodeViewer colors={{ accent: "#805AD5" }} />

            <Box mt={6}>
              <TransactionFlow status={txStatus} />
            </Box>
          </GridItem>

          <GridItem>
          <VStack spacing={6} align="stretch" position="sticky" top="24px">
            <InteractionConsole
              currentMessage={currentMessage}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleDeploy={handleDeploy}
              handleUpdate={handleUpdate}
              isProcessing={isProcessing}
              isDeployed={isDeployed}
              colors={colors}
            />

            <ContractInstancesPanel
              deployments={deployments}
              activeContractAddress={contractAddress}
              onSelect={handleSelectInstance}
              colors={colors}
            />
          </VStack>
        </GridItem>

        </Grid>

        {/* MINING CONTROLS */}
        <MiningControls
          isAutomine={mining.isAutomine}
          isMining={mining.isMining}
          lastMinedBlock={mining.lastMinedBlock}
          pendingCount={mempool.pendingCount}
          toggleMiningMode={mining.toggleMiningMode}
          manualMine={mining.manualMine}
        />

        <BlockchainControlPanel
          latestBlock={timer.latestBlock}
          secondsSinceLastBlock={timer.secondsSinceLastBlock}
          pendingCount={mempool.pendingCount}
        />

        <BlockchainVisualizer transactions={transactions} />
        <ContractEventsPanel
            contract={contractInstance}
            accentColor="#805AD5"
          />


        <Box>
          <HStack mb={4}>
            <Icon as={FaHistory} color="blue.500" />
            <Text fontSize="sm" fontWeight="bold" color={subTextColor}>
              HISTORIQUE
            </Text>
          </HStack>

          <TransactionHistory transactions={transactions} />
        </Box>
      </VStack>
    </Box>
  );
}
