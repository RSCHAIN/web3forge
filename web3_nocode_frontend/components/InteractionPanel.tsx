"use client";

import { useState, useMemo } from "react";
import { ethers } from "ethers";
import { 
  Button, Input, VStack, HStack, Text, Box, Icon, 
  useToast, FormControl, FormLabel, InputGroup, 
  useColorModeValue, Badge, SimpleGrid, Code
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { 
  FiSend, FiPlusCircle, FiTrash2, FiShield, FiCpu, FiInfo 
} from "react-icons/fi";

type ERC20ActionsProps = {
  contractAddress: string;
  abi: any[];
  tokenSymbol: string;
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

  const caps = useMemo(() => {
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
      toast({ title: "Transaction Broadcasted", status: "info" });
      await tx.wait();
      toast({ title: `✅ Success: ${methodName}`, status: "success" });
      setAmount("");
    } catch (err: any) {
      toast({ title: "Error", description: err.reason || err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      
      {/* --- APPROVE SECTION --- */}
      {caps.canApprove && (
        <VStack align="stretch" spacing={3}>
          <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
            <HStack mb={2} color="blue.500">
              <Icon as={FiShield} />
              <Text fontSize="xs" fontWeight="black" letterSpacing="widest">01. APPROVE (AUTHORIZATION)</Text>
            </HStack>
            
            {/* Description Pédagogique */}
            <Box mb={4} p={3} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
              <Text fontSize="11px" color="blue.800" fontWeight="medium">
                <b>Mastery Note:</b> This function grants a third party (the spender) permission to move tokens on your behalf. It modifies the <Code fontSize="10px">allowance</Code> mapping in the contract state. No tokens are moved during this call.
              </Text>
            </Box>

            <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
              <FormControl>
                <FormLabel fontSize="10px" fontWeight="black" color="gray.400">SPENDER ADDRESS</FormLabel>
                <Input bg={inputBg} placeholder="0x..." value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} fontSize="xs" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="10px" fontWeight="black" color="gray.400">ALLOWANCE LIMIT</FormLabel>
                <InputGroup size="sm">
                  <Input bg={inputBg} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                  <Button colorScheme="blue" isLoading={loading} onClick={() => handleTransaction("approve", [targetAddress, ethers.parseUnits(amount || "0", 18)])}>Set</Button>
                </InputGroup>
              </FormControl>
            </SimpleGrid>
          </Box>
        </VStack>
      )}

      {/* --- TRANSFER SECTION --- */}
      {caps.canTransfer && (
        <VStack align="stretch" spacing={3}>
          <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
            <HStack mb={2} color="purple.500">
              <Icon as={FiSend} />
              <Text fontSize="xs" fontWeight="black" letterSpacing="widest">02. TRANSFER (EXECUTION)</Text>
            </HStack>

            {/* Description Pédagogique */}
            <Box mb={4} p={3} bg="purple.50" borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
              <Text fontSize="11px" color="purple.800" fontWeight="medium">
                <b>Mastery Note:</b> A direct transfer between two users. It subtracts from your balance and adds to the recipient's. This is an <b>atomic</b> state transition: either both updates happen, or the whole transaction reverts.
              </Text>
            </Box>

            <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
              <FormControl>
                <FormLabel fontSize="10px" fontWeight="black" color="gray.400">RECIPIENT ADDRESS</FormLabel>
                <Input bg={inputBg} placeholder="0x..." value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} fontSize="xs" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="10px" fontWeight="black" color="gray.400">AMOUNT TO SEND</FormLabel>
                <InputGroup size="sm">
                  <Input bg={inputBg} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                  <Button colorScheme="purple" isLoading={loading} onClick={() => handleTransaction("transfer", [targetAddress, ethers.parseUnits(amount || "0", 18)])}>Send</Button>
                </InputGroup>
              </FormControl>
            </SimpleGrid>
          </Box>
        </VStack>
      )}

      {/* --- SUPPLY SECTION --- */}
      {(caps.canMint || caps.canBurn) && (
        <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} bg="gray.50">
          <HStack mb={2} color="orange.600">
            <Icon as={FiPlusCircle} />
            <Text fontSize="xs" fontWeight="black" letterSpacing="widest">03. SUPPLY MANAGEMENT (ECONOMY)</Text>
          </HStack>

          {/* Description Pédagogique */}
          <Box mb={4} p={3} bg="orange.50" borderRadius="lg" borderLeft="4px solid" borderColor="orange.400">
            <Text fontSize="11px" color="orange.800" fontWeight="medium">
              <b>Mastery Note:</b> Minting increases the <Code fontSize="10px">totalSupply</Code> variable, creating new units out of thin air. Burning does the opposite, removing units forever. This defines the token's monetary policy.
            </Text>
          </Box>
          
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="10px" fontWeight="black" color="gray.400">INPUT QUANTITY FOR MINT/BURN</FormLabel>
              <Input bg="white" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount to create or destroy..." fontSize="sm" />
            </FormControl>

            <HStack spacing={4}>
              {caps.canMint && (
                <Button flex="1" leftIcon={<FiPlusCircle />} colorScheme="green" size="md" borderRadius="xl" isLoading={loading} onClick={() => handleTransaction("mint", [address, ethers.parseUnits(amount || "0", 18)])}>
                  Mint Tokens
                </Button>
              )}
              {caps.canBurn && (
                <Button flex="1" leftIcon={<FiTrash2 />} colorScheme="red" variant="outline" size="md" borderRadius="xl" isLoading={loading} onClick={() => handleTransaction("burn", [ethers.parseUnits(amount || "0", 18)])}>
                  Burn Tokens
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      )}
    </VStack>
  );
}