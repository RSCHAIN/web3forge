"use client";

import {
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  Link,
  useClipboard,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { ExternalLinkIcon, CopyIcon, CheckIcon } from "@chakra-ui/icons";
import { FaGasPump, FaCube } from "react-icons/fa";

interface TxInfo {
  hash: string;
  type: "deploy" | "write";
  blockNumber: number;
  gasUsed: bigint;
  gasPrice: bigint;
}

interface Props {
  transactions: TxInfo[];
}

export default function TransactionHistory({ transactions }: Props) {
  // Fonction pour tronquer l'adresse
  const formatHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  if (transactions.length === 0) {
    return (
      <Box
        p={10}
        bg="whiteAlpha.50"
        borderRadius="2xl"
        border="1px dashed"
        borderColor="whiteAlpha.300"
        textAlign="center"
      >
        <Text fontSize="sm" color="gray.500">
          En attente de transactions sur le réseau...
        </Text>
      </Box>
    );
  }

  return (
    <Box 
      p={6} 
      bg="rgba(10, 10, 10, 0.8)" 
      backdropFilter="blur(10px)"
      borderRadius="2xl" 
      border="1px solid" 
      borderColor="whiteAlpha.200"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
    >
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between">
          <Text fontSize="md" color="white" fontWeight="semibold" letterSpacing="wider">
            ACTIVITÉ RÉCENTE
          </Text>
          <Badge colorScheme="whiteAlpha" variant="subtle" borderRadius="full" px={3}>
            {transactions.length} Tx
          </Badge>
        </HStack>

        <VStack align="stretch" spacing={3}>
          {transactions.map((tx) => (
            <TransactionItem key={tx.hash} tx={tx} formatHash={formatHash} />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}

// Sous-composant pour plus de clarté
function TransactionItem({ tx, formatHash }: { tx: TxInfo; formatHash: (h: string) => string }) {
  const { hasCopied, onCopy } = useClipboard(tx.hash);

  return (
    <Box
      p={4}
      borderRadius="xl"
      bg="whiteAlpha.50"
      transition="all 0.2s"
      _hover={{ bg: "whiteAlpha.100", transform: "translateY(-2px)" }}
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <HStack justify="space-between" mb={3}>
        <HStack>
          <Badge 
            variant="solid" 
            px={2} 
            borderRadius="md"
            colorScheme={tx.type === "deploy" ? "purple" : "cyan"}
            fontSize="2xs"
          >
            {tx.type.toUpperCase()}
          </Badge>
          <HStack spacing={1} color="gray.500">
            <Icon as={FaCube} boxSize={3} />
            <Text fontSize="xs" fontWeight="medium">
              {tx.blockNumber}
            </Text>
          </HStack>
        </HStack>
        
        <HStack spacing={2}>
          <Tooltip label={hasCopied ? "Copié !" : "Copier le hash"}>
            <IconButton
              aria-label="Copy hash"
              icon={hasCopied ? <CheckIcon color="green.400" /> : <CopyIcon />}
              size="xs"
              variant="ghost"
              onClick={onCopy}
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </Tooltip>
          <Link href={`https://etherscan.io/tx/${tx.hash}`} isExternal>
            <IconButton
              aria-label="View on explorer"
              icon={<ExternalLinkIcon />}
              size="xs"
              variant="ghost"
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </Link>
        </HStack>
      </HStack>

      <Text fontFamily="mono" fontSize="sm" color="blue.300" mb={3}>
        {formatHash(tx.hash)}
      </Text>

      <Divider borderColor="whiteAlpha.100" mb={3} />

      <HStack justify="space-between">
        <HStack spacing={4}>
          <HStack spacing={1}>
            <Icon as={FaGasPump} boxSize={3} color="gray.500" />
            <Text fontSize="xs" color="gray.400">
              <Text as="span" color="whiteAlpha.800" fontWeight="bold">
                {tx.gasUsed.toString()}
              </Text> units
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Price: {tx.gasPrice.toString()} gwei
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
}