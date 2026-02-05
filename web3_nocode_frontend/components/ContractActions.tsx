"use client";

import { useState, useMemo } from "react";
import { ethers } from "ethers";
import { 
  Button, Input, VStack, HStack, Text, Box, Icon, 
  useToast, FormControl, FormLabel, InputGroup, InputRightAddon,
  useColorModeValue, Badge, SimpleGrid, Heading
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { 
  FiSend, FiPlusCircle, FiTrash2, FiInfo, FiAlertCircle, 
  FiShield, FiCpu, FiCheckCircle, FiActivity 
} from "react-icons/fi";

type ERC20ActionsProps = {
  contractAddress: string;
  abi: any[];
  viewMode?: "pro" | "edu";
};

export default function ERC20Actions({
  contractAddress,
  abi,
  viewMode = "pro"
}: ERC20ActionsProps) {
  const { address } = useAccount(); 
  const [targetAddress, setTargetAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const inputBg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  // --- 1. DÉTECTION AUTOMATIQUE DES CAPACITÉS ---
  const capabilities = useMemo(() => {
    const names = abi.map(item => item.name);
    return {
      canTransfer: names.includes("transfer"),
      canApprove: names.includes("approve"),
      canMint: names.includes("mint"),
      canBurn: names.includes("burn"),
    };
  }, [abi]);

  async function handleTransaction(methodName: string, args: any[]) {
    if (!window.ethereum) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract[methodName](...args);
      toast({ title: "Broadcasting to EVM...", status: "info", duration: 2000 });
      await tx.wait();
      toast({ title: `Transaction Confirmed: ${methodName}`, status: "success" });
      setAmount("");
      setTargetAddress("");
    } catch (err: any) {
      toast({ title: "Execution Error", description: err.reason || err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      
      {/* --- SECTION 1: CONTRACT MANIFEST (PEDAGOGY) --- */}
      <Box p={4} borderRadius="xl" bg={useColorModeValue("purple.50", "whiteAlpha.50")} border="1px solid" borderColor="purple.100">
        <HStack mb={3} justify="space-between">
          <HStack><Icon as={FiCpu} color="purple.500"/><Text fontSize="xs" fontWeight="black">ABI INTERROGATION</Text></HStack>
          <Badge variant="outline" colorScheme="purple" fontSize="9px">Detected Features</Badge>
        </HStack>
        <SimpleGrid columns={2} spacing={2}>
          {Object.entries(capabilities).map(([key, value]) => (
            <HStack key={key} opacity={value ? 1 : 0.4}>
              <Icon as={value ? FiCheckCircle : FiAlertCircle} color={value ? "green.400" : "gray.400"} boxSize={3}/>
              <Text fontSize="10px" fontWeight="bold">{key.replace("can", "").toUpperCase()}</Text>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* --- SECTION 2: DYNAMIC FORMS --- */}
      <VStack spacing={6} align="stretch">
        
        {/* APPROVE FORM (Step 1) */}
        {capabilities.canApprove && (
          <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
            <HStack mb={4}><Icon as={FiShield} color="blue.400"/><Heading size="xs">Step 1: Authorization (Approve)</Heading></HStack>
            <VStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="10px" fontWeight="black" color="gray.400">SPENDER (ADDRESS)</FormLabel>
                <Input bg={inputBg} placeholder="0x..." value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} fontFamily="mono" fontSize="xs" />
              </FormControl>
              <InputGroup size="sm">
                <Input bg={inputBg} placeholder="Allowance" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Button colorScheme="blue" isLoading={loading} px={8} onClick={() => handleTransaction("approve", [targetAddress, ethers.parseUnits(amount || "0", 18)])}>Approve</Button>
              </InputGroup>
            </VStack>
          </Box>
        )}

        {/* TRANSFER FORM (Step 2) */}
        {capabilities.canTransfer && (
          <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
            <HStack mb={4}><Icon as={FiSend} color="purple.400"/><Heading size="xs">Step 2: Execution (Transfer)</Heading></HStack>
            <VStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="10px" fontWeight="black" color="gray.400">RECIPIENT (ADDRESS)</FormLabel>
                <Input bg={inputBg} placeholder="0x..." value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} fontFamily="mono" fontSize="xs" />
              </FormControl>
              <InputGroup size="sm">
                <Input bg={inputBg} placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Button colorScheme="purple" isLoading={loading} px={8} onClick={() => handleTransaction("transfer", [targetAddress, ethers.parseUnits(amount || "0", 18)])}>Send</Button>
              </InputGroup>
            </VStack>
          </Box>
        )}

        {/* MINT / BURN SECTION */}
        {(capabilities.canMint || capabilities.canBurn) && (
          <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} bg="gray.50">
             <HStack mb={4}><Icon as={FiActivity} color="orange.400"/><Heading size="xs">Supply Controls</Heading></HStack>
             <SimpleGrid columns={2} spacing={4}>
                {capabilities.canMint && (
                  <Button leftIcon={<FiPlusCircle />} colorScheme="green" variant="outline" size="sm" onClick={() => handleTransaction("mint", [address, ethers.parseUnits(amount || "1", 18)])}>Mint to Me</Button>
                )}
                {capabilities.canBurn && (
                  <Button leftIcon={<FiTrash2 />} colorScheme="red" variant="outline" size="sm" onClick={() => handleTransaction("burn", [ethers.parseUnits(amount || "1", 18)])}>Burn Mine</Button>
                )}
             </SimpleGrid>
             <Text fontSize="9px" color="gray.400" mt={2} textAlign="center">Note: Supply actions directly modify the contract's totalSupply variable.</Text>
          </Box>
        )}

      </VStack>
    </VStack>
  );
}