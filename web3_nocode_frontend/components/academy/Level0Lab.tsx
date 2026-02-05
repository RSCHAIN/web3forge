"use client";

import { useState, useEffect } from "react";
import {
  VStack,  Flex, Grid, GridItem,  useToast,
} from "@chakra-ui/react";
import { motion} from "framer-motion";
import { ethers } from "ethers";
import { API_BASE } from "../../lib/api";
import ContractLifecycle from "./ContractLifecycle";
import ContractCodeViewer from "./ContractCodeViewer";
import TransactionFlow from "./TransactionFlow";
import InteractionConsole from "./InteractionConsole";
import { useAccount } from "wagmi";

const MotionFlex = motion(Flex);

interface Level0LabProps {
  contractAddress?: string;
  abi?: any[];
  onDeploySuccess: () => void;
}


// --- COMPOSANT PRINCIPAL ---
export default function Level0Lab({ contractAddress, abi, onDeploySuccess }: Level0LabProps) {
  const { address } = useAccount();
  const toast = useToast();

  const [currentMessage, setCurrentMessage] = useState<string>("...");
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "signing" | "broadcast" | "validating" | "confirmed">("idle");

  const colors = { bg: "#0D0D12", panel: "#16161D", border: "#2D2D39", accent: "#805AD5", text: "#F7FAFC", code: "#000000" };

  useEffect(() => {
    async function init() {
      if (!contractAddress || !abi || !window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        setContractInstance(new ethers.Contract(contractAddress, abi, signer));
      } catch (e) { console.error(e); }
    }
    init();
  }, [contractAddress, abi]);

  const fetchStorage = async () => {
    if (!contractInstance) return;
    try {
      const msg = await contractInstance.message();
      setCurrentMessage(msg);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (contractInstance) fetchStorage(); }, [contractInstance]);

  const handleUpdate = async () => {
    if (!contractInstance || !newMessage) return;
    setIsProcessing(true);
    try {
      setTxStatus("signing");
      const tx = await contractInstance.setMessage(newMessage);
      setTxStatus("broadcast");
      setTxStatus("validating");
      await tx.wait();
      setTxStatus("confirmed");
      toast({ title: "Success", status: "success" });
      fetchStorage();
      setNewMessage("");
      setTimeout(() => setTxStatus("idle"), 4000);
    } catch (e: any) {
      setTxStatus("idle");
      toast({ title: "Error", description: e.message, status: "error" });
    } finally { setIsProcessing(false); }
  };

  return (
    <VStack spacing={8} align="stretch" w="full" color={colors.text}>
      
      {/* 1. VISUALISATION DU CYCLE DE VIE */}
      <ContractLifecycle 
                contractAddress={contractAddress} 
                txStatus={txStatus} 
                colors={colors} 
            />

      {/* 2. ÉDITEUR ET PIPELINE */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={8}>
        <GridItem colSpan={2}>
          <VStack align="stretch" spacing={6}>
            <ContractCodeViewer colors={colors} />
            
            {/* INTÉGRATION DU TRANSACTION FLOW */}
            <TransactionFlow status={txStatus} />
          </VStack>
        </GridItem>

        {/* 3. CONSOLE D'INTERACTION */}
        <GridItem colSpan={1}>
          <InteractionConsole 
            currentMessage={currentMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleUpdate={handleUpdate}
            isProcessing={isProcessing}
            colors={colors}
          />
        </GridItem>
      </Grid>
    </VStack>
  );
}