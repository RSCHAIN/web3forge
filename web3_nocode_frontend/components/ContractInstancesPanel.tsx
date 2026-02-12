"use client";

import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaLayerGroup, FaCheckCircle } from "react-icons/fa";
import type { DeploymentInfo } from "./types/txinfo"; // ajuste le chemin si besoin

type LabColors = {
  panel: string;
  border: string;
  accent: string;
};

interface Props {
  deployments: DeploymentInfo[];
  activeContractAddress?: string | null;
  onSelect: (deployment: DeploymentInfo) => void;
  colors: LabColors;
}

export default function ContractInstancesPanel({
  deployments,
  activeContractAddress,
  onSelect,
  colors,
}: Props) {
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const activeBg = useColorModeValue("purple.50", "whiteAlpha.100");
  const subtle = useColorModeValue("gray.500", "gray.400");

  return (
    <Box p={5} bg={colors.panel} borderRadius="2xl" border="1px solid" borderColor={colors.border}>
      <HStack mb={4}>
        <Icon as={FaLayerGroup} color="orange.400" />
        <Text fontSize="xs" fontWeight="black" color={subtle}>
          INSTANCES
        </Text>
      </HStack>

      <VStack align="stretch" spacing={3}>
        {deployments.length === 0 ? (
          <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>
            Aucun déploiement
          </Text>
        ) : (
          deployments.map((d) => {
            const isActive = d.contract_address === activeContractAddress;

            return (
              <Box
                key={d.tx_hash}
                p={3}
                cursor="pointer"
                onClick={() => onSelect(d)}
                bg={isActive ? activeBg : "transparent"}
                borderRadius="xl"
                border="1px solid"
                borderColor={isActive ? colors.accent : colors.border}
                _hover={{
                  bg: isActive ? activeBg : hoverBg,
                  borderColor: isActive ? colors.accent : "purple.300",
                }}
                transition="all 0.2s"
              >
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" fontWeight="bold">
                    {isActive ? "Actif" : "Instance"}
                  </Text>
                  {isActive && <Icon as={FaCheckCircle} color="purple.500" />}
                </HStack>

                <Text fontSize="10px" fontFamily="mono" isTruncated color="gray.500">
                  {d.contract_address}
                </Text>

                <Text fontSize="10px" color="gray.500">
                  Block: {d.blockNumber ?? "—"} • Chain: {d.chain ?? "—"}
                </Text>
              </Box>
            );
          })
        )}
      </VStack>
    </Box>
  );
}
