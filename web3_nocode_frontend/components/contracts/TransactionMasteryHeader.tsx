"use client";

import { 
  Box, Text, VStack, HStack, Icon, SimpleGrid, 
  Divider, useColorModeValue, Heading 
} from "@chakra-ui/react";
import { FiCpu, FiHash, FiLayers, FiZap } from "react-icons/fi";

export function TransactionMasteryHeader() {
  const bg = useColorModeValue("purple.50", "rgba(128, 90, 213, 0.05)");
  const borderColor = useColorModeValue("purple.200", "purple.500");

  return (
    <Box p={6} mb={8} borderRadius="2xl" border="1px solid" borderColor={borderColor} bg={bg}>
      <VStack align="stretch" spacing={5}>
        <HStack spacing={3}>
          <Icon as={FiCpu} color="purple.400" boxSize={6} />
          <Heading size="sm" letterSpacing="tight">Blockchain Transaction Anatomy</Heading>
        </HStack>
        
        <Text fontSize="xs" color="gray.500">
          Every transaction on the network is an <b>instruction</b> sent to the EVM. It consists of a specific structure that ensures security and traceability.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box p={3} bg="blackAlpha.200" borderRadius="lg">
            <HStack mb={2}><Icon as={FiHash} color="purple.300" fontSize="xs"/><Text fontSize="xs" fontWeight="bold">The Hash</Text></HStack>
            <Text fontSize="10px" color="gray.500">A unique 64-character identifier. Think of it as a digital fingerprint of the entire transaction data.</Text>
          </Box>
          
          <Box p={3} bg="blackAlpha.200" borderRadius="lg">
            <HStack mb={2}><Icon as={FiLayers} color="purple.300" fontSize="xs"/><Text fontSize="xs" fontWeight="bold">Logs & Topics</Text></HStack>
            <Text fontSize="10px" color="gray.500">Events emitted by Smart Contracts. Topics are searchable (indexed), while Data is raw information.</Text>
          </Box>

          <Box p={3} bg="blackAlpha.200" borderRadius="lg">
            <HStack mb={2}><Icon as={FiZap} color="purple.300" fontSize="xs"/><Text fontSize="xs" fontWeight="bold">The State</Text></HStack>
            <Text fontSize="10px" color="gray.500">Transactions don't move "files"; they update numbers in a global ledger. This is an atomic state change.</Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}