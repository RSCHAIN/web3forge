"use client";

import { 
  HStack, 
  Button, 
  Badge, 
  Text, 
  Icon, 
  Box, 
  Tooltip,
  useColorModeValue 
} from "@chakra-ui/react";
import { FaHammer, FaRobot, FaLayerGroup } from "react-icons/fa";

interface Props {
  isAutomine: boolean;
  isMining: boolean;
  lastMinedBlock: number | null;
  pendingCount: number;
  toggleMiningMode: () => void;
  manualMine: () => void;
}

export default function MiningControls({
  isAutomine,
  isMining,
  lastMinedBlock,
  pendingCount,
  toggleMiningMode,
  manualMine,
}: Props) {
  const borderColor = useColorModeValue("gray.200", "#30363D");
  const bgActive = useColorModeValue("green.50", "rgba(56, 161, 105, 0.1)");
  const bgManual = useColorModeValue("purple.50", "rgba(128, 90, 213, 0.1)");

  return (
    <HStack 
      spacing={3} 
      p={1} 
      bg={useColorModeValue("gray.100", "blackAlpha.400")} 
      borderRadius="md" 
      border="1px solid" 
      borderColor={borderColor}
    >
      {/* Sélecteur de Mode */}
      <Tooltip label={isAutomine ? "Switch to Manual Control" : "Switch to Auto-Mining"}>
        <Button
          size="xs"
          variant="ghost"
          colorScheme={isAutomine ? "green" : "purple"}
          leftIcon={<Icon as={isAutomine ? FaRobot : FaHammer} />}
          onClick={toggleMiningMode}
          px={3}
          h="28px"
          bg={isAutomine ? bgActive : bgManual}
          _hover={{ opacity: 0.8 }}
        >
          {isAutomine ? "AUTOMINE" : "MANUAL"}
        </Button>
      </Tooltip>

      <Box w="1px" h="15px" bg={borderColor} />

      {/* Action Mine */}
      <Button
        size="xs"
        colorScheme="orange"
        variant="solid"
        isLoading={isMining}
        loadingText="MINING..."
        onClick={manualMine}
        isDisabled={isAutomine || pendingCount === 0}
        h="28px"
        fontSize="10px"
        fontWeight="black"
        boxShadow="0 0 10px rgba(237, 137, 54, 0.2)"
      >
        EXECUTE_MINE
      </Button>

      {/* Stats Mempool */}
      <HStack spacing={2} px={2}>
        <Icon as={FaLayerGroup} color="yellow.500" boxSize={3} />
        <Badge 
          variant="unstyled" 
          color="yellow.500" 
          fontSize="10px" 
          fontFamily="mono"
          mb="-1px"
        >
          MEMPOOL: {pendingCount}
        </Badge>
      </HStack>

      {lastMinedBlock && (
        <>
          <Box w="1px" h="15px" bg={borderColor} />
          <Text fontSize="10px" color="gray.500" fontFamily="mono" px={2}>
            L_BLOCK: #{lastMinedBlock}
          </Text>
        </>
      )}
    </HStack>
  );
}