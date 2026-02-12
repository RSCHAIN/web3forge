"use client";

import { 
  Box, HStack, Text, Icon, VStack, useColorModeValue, Divider, 
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, 
  PopoverBody, PopoverArrow, Badge, List, ListItem, Flex
} from "@chakra-ui/react";
import { FaCube, FaClock, FaLayerGroup, FaArrowRight } from "react-icons/fa";

interface PendingTx {
  hash: string;
  from: string;
  value: string;
}

interface Props {
  latestBlock: number | null;
  secondsSinceLastBlock: number;
  pendingCount: number;
  pendingTransactions?: PendingTx[]; // Nouvelle prop pour le contenu
}

export default function BlockchainControlPanel({
  latestBlock,
  secondsSinceLastBlock,
  pendingCount,
  pendingTransactions = [],
}: Props) {
  const borderColor = useColorModeValue("gray.200", "#30363D");
  const popoverBg = useColorModeValue("white", "#161B22");
  const labelColor = "gray.500";
  const valueColor = useColorModeValue("gray.800", "white");

  return (
    <Box
      px={6}
      py={2}
      bg={useColorModeValue("white", "blackAlpha.300")}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
    >
      <HStack spacing={8} h="40px">
        {/* BLOCK HEIGHT */}
        <HStack spacing={3}>
          <Icon as={FaCube} color="blue.400" boxSize={3} />
          <VStack align="start" spacing={0}>
            <Text fontSize="9px" fontWeight="black" color={labelColor} letterSpacing="1px">BLOCK_HEIGHT</Text>
            <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color={valueColor}>
              #{latestBlock ?? "---"}
            </Text>
          </VStack>
        </HStack>

        <Divider orientation="vertical" h="20px" borderColor={borderColor} />

        {/* MEMPOOL STATUS + INTERACTION */}
        <Popover trigger="hover" placement="bottom-start">
          <PopoverTrigger>
            <HStack spacing={3} cursor="pointer" _hover={{ opacity: 0.7 }}>
              <Icon as={FaLayerGroup} color="orange.400" boxSize={3} />
              <VStack align="start" spacing={0}>
                <Text fontSize="9px" fontWeight="black" color={labelColor} letterSpacing="1px">MEMPOOL_SIZE</Text>
                <HStack spacing={2}>
                  <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color={valueColor}>{pendingCount} TX</Text>
                  {pendingCount > 0 && <Badge colorScheme="orange" variant="solid" fontSize="8px" borderRadius="full" h="10px" w="10px" />}
                </HStack>
              </VStack>
            </HStack>
          </PopoverTrigger>
          
          <PopoverContent bg={popoverBg} borderColor={borderColor} boxShadow="2xl" w="300px">
            <PopoverArrow bg={popoverBg} />
            <PopoverHeader borderBottomWidth="1px" borderColor={borderColor} fontSize="xs" fontWeight="black" color="orange.400">
              PENDING_TRANSACTIONS (MEMPOOL)
            </PopoverHeader>
            <PopoverBody p={0}>
              {pendingCount === 0 ? (
                <Text p={4} fontSize="xs" color="gray.500" textAlign="center">Mempool is empty.</Text>
              ) : (
                <List spacing={0}>
                  {pendingTransactions.map((tx, idx) => (
                    <ListItem 
                      key={tx.hash} 
                      p={3} 
                      borderBottom={idx !== pendingTransactions.length - 1 ? "1px solid" : "none"}
                      borderColor={borderColor}
                      _hover={{ bg: "whiteAlpha.50" }}
                    >
                      <VStack align="stretch" spacing={1}>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="10px" fontFamily="mono" color="blue.300">{tx.hash.slice(0, 14)}...</Text>
                          <Badge size="xs" colorScheme="green" fontSize="8px">PENDING</Badge>
                        </Flex>
                        <HStack fontSize="9px" color="gray.500">
                          <Text isTruncated>From: {tx.from.slice(0, 8)}...</Text>
                          <Icon as={FaArrowRight} />
                          <Text fontWeight="bold" color="gray.300">{tx.value} ETH</Text>
                        </HStack>
                      </VStack>
                    </ListItem>
                  ))}
                </List>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Divider orientation="vertical" h="20px" borderColor={borderColor} />

        {/* TIMER */}
        <HStack spacing={3}>
          <Icon as={FaClock} color={secondsSinceLastBlock > 30 ? "red.400" : "green.400"} boxSize={3} />
          <VStack align="start" spacing={0}>
            <Text fontSize="9px" fontWeight="black" color={labelColor} letterSpacing="1px">LATENCY</Text>
            <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color={valueColor}>
              {secondsSinceLastBlock}s
            </Text>
          </VStack>
        </HStack>
      </HStack>
    </Box>
  );
}