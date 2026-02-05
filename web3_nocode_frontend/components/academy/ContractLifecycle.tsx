"use client";

import { Box, VStack, HStack, Heading, Text, Icon, Flex, Tooltip } from "@chakra-ui/react";
import { FiActivity, FiPlusCircle, FiZap, FiDatabase } from "react-icons/fi";

interface ContractLifecycleProps {
  contractAddress?: string;
  txStatus: "idle" | "signing" | "broadcast" | "validating" | "confirmed";
  colors: {
    panel: string;
    border: string;
  };
}

export default function ContractLifecycle({ contractAddress, txStatus, colors }: ContractLifecycleProps) {
  const isDeployed = !!contractAddress;
  const hasMutated = txStatus === "confirmed";

  return (
    <Box bg={colors.panel} p={6} borderRadius="2xl" border="1px solid" borderColor={colors.border}>
      <HStack mb={8} spacing={3}>
        <Icon as={FiActivity} color="orange.400" />
        <Heading size="xs" letterSpacing="widest" textTransform="uppercase" color="gray.400">
          Contract Journey: From Code to Blockchain
        </Heading>
      </HStack>

      <Flex justify="space-between" align="center" position="relative">
        
        {/* STEP 1: DEPLOYMENT (THE BIRTH) */}
        <VStack flex="1" zIndex={2}>
          <Tooltip label="The one-time process of uploading your code to the blockchain." hasArrow>
            <Flex 
              boxSize="44px" 
              bg={isDeployed ? "blue.500" : "whiteAlpha.100"} 
              borderRadius="full" 
              align="center" 
              justify="center"
              transition="all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              boxShadow={isDeployed ? "0 0 20px rgba(66, 153, 225, 0.6)" : "none"}
              cursor="help"
            >
              <Icon as={FiPlusCircle} color="white" boxSize={5} />
            </Flex>
          </Tooltip>
          <VStack spacing={0} mt={2}>
            <Text fontSize="11px" fontWeight="black" color={isDeployed ? "white" : "gray.600"}>DEPLOYMENT</Text>
            <Text fontSize="9px" color="gray.500" fontWeight="bold">Initial Setup</Text>
          </VStack>
        </VStack>

        {/* CONNECTOR 1 */}
        <Box h="2px" flex="2" bg={isDeployed ? "blue.500" : "whiteAlpha.100"} mx={-2} mb={10} transition="all 0.6s" />

        {/* STEP 2: INTERACTION (THE ACTION) */}
        <VStack flex="1" zIndex={2}>
          <Tooltip label="Every time you update the message, you are sending a new request to the network." hasArrow>
            <Flex 
              boxSize="44px" 
              bg={hasMutated ? "purple.500" : "whiteAlpha.100"} 
              borderRadius="full" 
              align="center" 
              justify="center"
              transition="all 0.6s"
              boxShadow={hasMutated ? "0 0 20px rgba(159, 122, 234, 0.6)" : "none"}
              cursor="help"
            >
              <Icon as={FiZap} color="white" boxSize={5} />
            </Flex>
          </Tooltip>
          <VStack spacing={0} mt={2}>
            <Text fontSize="11px" fontWeight="black" color={hasMutated ? "white" : "gray.600"}>INTERACTION</Text>
            <Text fontSize="9px" color="gray.500" fontWeight="bold">Live Updates</Text>
          </VStack>
        </VStack>

        {/* CONNECTOR 2 */}
        <Box h="2px" flex="2" bg={hasMutated ? "purple.500" : "whiteAlpha.100"} mx={-2} mb={10} transition="all 0.6s" />

        {/* STEP 3: PERSISTENCE (THE RESULT) */}
        <VStack flex="1" zIndex={2}>
          <Tooltip label="Your data is now permanently recorded in a global digital safe." hasArrow>
            <Flex 
              boxSize="44px" 
              bg={isDeployed ? "green.500" : "whiteAlpha.100"} 
              borderRadius="full" 
              align="center" 
              justify="center"
              transition="all 0.6s"
              boxShadow={isDeployed ? "0 0 20px rgba(72, 187, 120, 0.6)" : "none"}
              cursor="help"
            >
              <Icon as={FiDatabase} color="white" boxSize={5} />
            </Flex>
          </Tooltip>
          <VStack spacing={0} mt={2}>
            <Text fontSize="11px" fontWeight="black" color={isDeployed ? "white" : "gray.600"}>PERSISTENCE</Text>
            <Text fontSize="9px" color="gray.500" fontWeight="bold">Global Storage</Text>
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
}