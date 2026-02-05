"use client";

import { useEffect, useState } from "react";
import { 
  Box, Text, VStack, HStack, Spinner, Icon, Badge, Flex, 
  useColorModeValue, Collapse, Divider, Button, SimpleGrid, Code,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { 
  FiArrowUpRight, FiArrowDownLeft, FiExternalLink, 
  FiChevronDown, FiChevronUp, FiInfo, FiActivity,
  FiArrowRight, FiFileText, FiZap, FiClock 
} from "react-icons/fi";
import { API_BASE } from "../../lib/api";

export default function ERC20Transactions({
  contractAddress,
  network,
  userAddress,
  tokenSymbol = "TK",
}: {
  contractAddress: string;
  network: string;
  userAddress?: string;
  tokenSymbol?: string;
}) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const [eduStep, setEduStep] = useState<"intro" | "sig" | "from" | "to" | "data" | "gas" | "block">("intro");

  const containerBg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const highlightBg = useColorModeValue("purple.50", "rgba(128, 90, 213, 0.1)");

  const TRANSFER_SIG = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  useEffect(() => {
    async function fetchTxs() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/dashboard/contract/transactions?contract_address=${contractAddress}&network=${network}`);
        const data = await res.json();
        setTxs(data.transactions || []);
      } catch (e) { console.error("Fetch Error:", e); } finally { setLoading(false); }
    }
    fetchTxs();
  }, [contractAddress, network]);

  const getEduContent = () => {
    switch (eduStep) {
      case "sig": return { title: "Topic [0]: Event Signature", text: "The keccak256 hash of 'Transfer(address,address,uint256)'. It identifies the action type for indexers." };
      case "from": return { title: "Topic [1]: Origin", text: "Address of the sender. If it's 0x00..., it's a 'Mint' event (creation from the null address)." };
      case "to": return { title: "Topic [2]: Destination", text: "Address of the receiver. If it's 0x00..., it's a 'Burn' event (destruction)." };
      case "data": return { title: "Unindexed Data: Amount", text: "The raw hexadecimal value. We convert this Base-16 number into a readable Decimal format." };
      case "gas": return { title: "Gas Used: Computational Cost", text: "Shows the units consumed. Simple transfers cost ~21k, but contract logic increases this cost." };
      case "block": return { title: "Block Metadata", text: "The unique hash and timestamp proving the transaction is finalized on the ledger." };
      default: return { title: "Forensic Analysis", text: "Click on any machine-readable field to decode the underlying EVM architecture." };
    }
  };

  if (loading) return <Spinner color="purple.500" thickness="3px" />;

  return (
    <VStack align="stretch" spacing={3}>
      {txs.map((tx, i) => {
        const isOut = userAddress && tx.from.toLowerCase() === userAddress.toLowerCase();
        const isOpen = expandedIndex === i;
        const isMint = tx.from === "0x0000000000000000000000000000000000000000";
        const isBurn = tx.to === "0x0000000000000000000000000000000000000000";
        
        const rawSender = "0x" + tx.from.slice(2).padStart(64, "0");
        const rawReceiver = "0x" + tx.to.slice(2).padStart(64, "0");
        const rawValue = ethers.toBeHex(BigInt(tx.value || 0), 32);

        return (
          <Box key={i} borderRadius="2xl" border="1px solid" borderColor={isOpen ? "purple.400" : borderColor} bg={containerBg} overflow="hidden">
            
            {/* --- HEADER ROW (ALWAYS VISIBLE) --- */}
            <Flex p={4} align="center" justify="space-between" cursor="pointer" onClick={() => setExpandedIndex(isOpen ? null : i)}>
              <HStack spacing={4}>
                <Flex p={2.5} borderRadius="xl" bg={isOut ? "orange.50" : "green.50"}>
                  <Icon as={isOut ? FiArrowUpRight : FiArrowDownLeft} color={isOut ? "orange.500" : "green.500"} />
                </Flex>
                <VStack align="flex-start" spacing={0}>
                  <HStack>
                    <Text fontSize="sm" fontWeight="800">
                      {ethers.formatUnits(tx.value || "0", 18)} <Text as="span" color="purple.500" fontSize="xs">{tokenSymbol}</Text>
                    </Text>
                    {isMint && <Badge colorScheme="green" variant="subtle" fontSize="2xs">MINT</Badge>}
                    {isBurn && <Badge colorScheme="red" variant="subtle" fontSize="2xs">BURN</Badge>}
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiClock} fontSize="10px" color="gray.400" />
                    <Text fontSize="10px" color="gray.500">{tx.block_time || "Pending"}</Text>
                  </HStack>
                </VStack>
              </HStack>

              <HStack spacing={6}>
                <VStack align="flex-end" spacing={0}>
                  <HStack spacing={1}>
                    <Icon as={FiZap} fontSize="10px" color="orange.400" />
                    <Text fontSize="10px" fontWeight="black">{tx.gas_used?.toLocaleString() || "???"} GAS</Text>
                  </HStack>
                  <Text fontSize="10px" color="gray.400">BLOCK #{tx.block}</Text>
                </VStack>
                <Icon as={isOpen ? FiChevronUp : FiChevronDown} />
              </HStack>
            </Flex>

            {/* --- EXPANDED FORENSIC DECODER --- */}
            <Collapse in={isOpen}>
              <Box p={6} bg={useColorModeValue("gray.25", "blackAlpha.300")} borderTop="1px solid" borderColor={borderColor}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
                  
                  {/* LEFT: FULL TECHNICAL PAYLOAD */}
                  <VStack align="stretch" spacing={4}>
                    <Text fontSize="10px" fontWeight="black" color="purple.500" letterSpacing="widest">EVM LOG STRUCTURE</Text>
                    
                    {/* Topic 0: Signature */}
                    <Box cursor="help" onClick={() => setEduStep("sig")}>
                      <Text fontSize="9px" fontWeight="bold" color="gray.400" mb={1}>TOPIC [0] - SIGNATURE</Text>
                      <Code w="full" p={2} fontSize="2xs" colorScheme={eduStep === "sig" ? "purple" : "gray"} variant="outline" borderRadius="md" wordBreak="break-all">
                        {TRANSFER_SIG.slice(0, 40)}...
                      </Code>
                    </Box>

                    {/* Topic 1: From */}
                    <Box cursor="help" onClick={() => setEduStep("from")}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="9px" fontWeight="bold" color="gray.400">TOPIC [1] - FROM</Text>
                        {isMint && <Badge colorScheme="green" variant="solid" fontSize="8px">MINT</Badge>}
                      </HStack>
                      <Code w="full" p={2} fontSize="2xs" colorScheme={eduStep === "from" ? "purple" : "gray"} variant="outline" borderRadius="md">
                        {isMint ? "0x000...000 (The Void)" : rawSender.slice(0, 40) + "..."}
                      </Code>
                    </Box>

                    {/* Topic 2: To */}
                    <Box cursor="help" onClick={() => setEduStep("to")}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="9px" fontWeight="bold" color="gray.400">TOPIC [2] - TO</Text>
                        {isBurn && <Badge colorScheme="red" variant="solid" fontSize="8px">BURN</Badge>}
                      </HStack>
                      <Code w="full" p={2} fontSize="2xs" colorScheme={eduStep === "to" ? "purple" : "gray"} variant="outline" borderRadius="md">
                        {isBurn ? "0x000...000 (Black Hole)" : rawReceiver.slice(0, 40) + "..."}
                      </Code>
                    </Box>

                    {/* Data: Value Hex + Dec */}
                    <Box cursor="help" onClick={() => setEduStep("data")}>
                      <Text fontSize="9px" fontWeight="bold" color="gray.400" mb={1}>DATA - HEXADECIMAL VALUE</Text>
                      <Code w="full" p={2} fontSize="2xs" colorScheme={eduStep === "data" ? "green" : "gray"} variant="outline" borderRadius="md">
                        {rawValue}
                      </Code>
                      <Text fontSize="9px" color="green.600" mt={1} fontWeight="bold" fontFamily="mono">
                        RAW DECIMAL: {BigInt(tx.value || 0).toString()} wei
                      </Text>
                    </Box>

                    {/* Gas Progress Bar */}
                    <Box cursor="help" onClick={() => setEduStep("gas")}>
                      <Text fontSize="9px" fontWeight="bold" color="gray.400" mb={1}>GAS EFFORT</Text>
                      <HStack spacing={2}>
                        <Box flex="1" h="4px" bg="gray.200" borderRadius="full" overflow="hidden">
                          <Box w={`${Math.min(((tx.gas_used || 0) / 100000) * 100, 100)}%`} h="full" bg="orange.400" />
                        </Box>
                        <Text fontSize="9px" fontWeight="bold" color="orange.600">
                          {tx.gas_used > 21000 ? "Contract Ops" : "Base"}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>

                  {/* RIGHT: PEDAGOGICAL INSIGHT PANEL */}
                  <VStack align="stretch" spacing={5} p={6} bg={highlightBg} borderRadius="2xl" border="1px solid" borderColor="purple.200">
                   <HStack color="purple.600">
                      <Icon as={FiActivity} />
                      <Text fontSize="sm" fontWeight="800">Logic Flow: {getEduContent().title}</Text>
                    </HStack>

                    {/* LE GRAPHE LOGIQUE VISUEL */}
                    <Box p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="purple.100">
                      {eduStep === "sig" && (
                        <VStack spacing={2} align="center">
                            <Badge colorScheme="blue" variant="outline">Function String</Badge>
                            <Icon as={FiChevronDown} />
                            <Badge colorScheme="purple">Keccak-256 Hash</Badge>
                            <Icon as={FiChevronDown} />
                            <Badge colorScheme="orange">Topic [0] Signature</Badge>
                            <Text fontSize="9px" color="gray.500" textAlign="center" mt={2}>
                              The EVM maps the hash back to the human-readable function name using the ABI.
                            </Text>
                        </VStack>
                      )}

                      {eduStep === "data" && (
                        <HStack justify="space-around" align="center" h="80px">
                            <VStack spacing={0}>
                              <Text fontSize="10px" fontWeight="bold">Hex</Text>
                              <Code fontSize="10px">0xde0b...</Code>
                            </VStack>
                            <Icon as={FiArrowRight} />
                            <VStack spacing={0}>
                              <Text fontSize="10px" fontWeight="bold">Base 10</Text>
                              <Text fontSize="10px" fontFamily="mono">10^18 units</Text>
                            </VStack>
                            <Icon as={FiArrowRight} />
                            <VStack spacing={0}>
                              <Text fontSize="10px" fontWeight="bold" color="purple.500">UI</Text>
                              <Text fontSize="10px" fontWeight="bold">1.0 {tokenSymbol}</Text>
                            </VStack>
                        </HStack>
                      )}

                      {eduStep === "gas" && (
                        <VStack align="stretch" spacing={2}>
                            <Flex justify="space-between" fontSize="9px">
                              <Text>Base Fee</Text>
                              <Text fontWeight="bold">21,000</Text>
                            </Flex>
                            <Box h="2px" bg="gray.100" />
                            <Flex justify="space-between" fontSize="9px">
                              <Text>EVM Opcodes (SSTORE, etc.)</Text>
                              <Text fontWeight="bold">~13,105</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" fontSize="10px" fontWeight="bold" color="orange.600">
                              <Text>Total Gas</Text>
                              <Text>{tx.gas_used}</Text>
                            </Flex>
                        </VStack>
                      )}
                    </Box>

                    <Text fontSize="xs" color="gray.700" lineHeight="tall">{getEduContent().text}</Text>
                    <HStack color="purple.600">
                      <Icon as={FiInfo} />
                      <Text fontSize="sm" fontWeight="800">{getEduContent().title}</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.700" lineHeight="tall">{getEduContent().text}</Text>
                    <Divider borderColor="purple.200" />
                    <VStack align="stretch" spacing={3} fontSize="10px">
                       <Box onClick={() => setEduStep("block")} cursor="pointer">
                          <Text fontWeight="black" color="gray.400">BLOCK HASH</Text>
                          <Code variant="unstyled" color="gray.600" fontSize="9px" wordBreak="break-all">{tx.block_hash || "N/A"}</Code>
                       </Box>
                       <Box>
                          <Text fontWeight="black" color="gray.400">TRANSACTION HASH</Text>
                          <Code variant="unstyled" color="gray.600" fontSize="9px" wordBreak="break-all">{tx.tx_hash}</Code>
                       </Box>
                    </VStack>
                    <Button size="sm" colorScheme="purple" leftIcon={<FiExternalLink />} onClick={() => window.open(`https://etherscan.io/tx/${tx.tx_hash}`)}>
                      Explore on Chain
                    </Button>
                  </VStack>

                </SimpleGrid>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </VStack>
  );
}