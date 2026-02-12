"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  IconButton,
  Link,
  useClipboard,
  Divider,
  Icon,
  useColorModeValue,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { FaCube, FaArrowRight, FaWallet, FaFileContract, FaSearchPlus } from "react-icons/fa";
import { ethers } from "ethers";
import type { TxInfo } from "../types/txinfo";

interface Props {
  transactions: TxInfo[];
  itemsPerPage?: number;
  explorerBaseUrl?: string; // ex: https://sepolia.etherscan.io
}

type TxStatus = "success" | "failed" | "pending" | undefined;

export default function TransactionHistory({
  transactions,
  itemsPerPage = 10,
  explorerBaseUrl,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  // UI
  const containerBg = useColorModeValue("white", "rgba(22, 22, 29, 0.6)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  // Filters
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "deploy" | "call">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "pending">("all");
  const [minEth, setMinEth] = useState<string>("");

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  // Explorer base URL (multi-network ready)
  const explorer = useMemo(() => {
    if (explorerBaseUrl) return explorerBaseUrl.replace(/\/$/, "");
    const net = process.env.NEXT_PUBLIC_NETWORK?.toLowerCase();
    return (net === "mainnet" ? "https://etherscan.io" : "https://sepolia.etherscan.io").replace(/\/$/, "");
  }, [explorerBaseUrl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minEth.trim() ? Number(minEth) : undefined;

    return transactions.filter((tx) => {
      const typeOk =
        typeFilter === "all" ? true : typeFilter === "deploy" ? tx.type === "deploy" : tx.type !== "deploy";

      const st = (tx as any).status as TxStatus;
      const statusOk = statusFilter === "all" ? true : (st ?? "pending") === statusFilter;

      const hash = (tx.hash ?? "").toLowerCase();
      const from = (tx.from ?? "").toLowerCase();
      const to = (tx.to ?? "").toLowerCase();
      const block = String(tx.blockNumber ?? "").toLowerCase();

      const queryOk = !q ? true : hash.includes(q) || from.includes(q) || to.includes(q) || block.includes(q);

      let minOk = true;
      if (min !== undefined && !Number.isNaN(min)) {
        const v = tx.value ? Number(ethers.formatEther(tx.value)) : 0;
        minOk = v >= min;
      }

      return typeOk && statusOk && queryOk && minOk;
    });
  }, [transactions, query, typeFilter, statusFilter, minEth]);

  // Pagination (based on filtered)
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  useEffect(() => {
    // Clamp page if filter reduces pages
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Box
        p={10}
        bg="whiteAlpha.50"
        borderRadius="2xl"
        border="1px dashed"
        borderColor={borderColor}
        textAlign="center"
      >
        <Text fontSize="sm" color="gray.500" fontWeight="medium">
          En attente de flux de données...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      bg={containerBg}
      backdropFilter="blur(10px)"
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={5}>
        {/* Header */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <HStack>
            <Icon as={FaSearchPlus} color="purple.400" />
            <Text fontSize="xs" fontWeight="black" letterSpacing="widest" textTransform="uppercase">
              Explorateur de Flux
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3}>
              {filtered.length} / {transactions.length} Tx
            </Badge>
          </HStack>
        </HStack>

        {/* Filters */}
        <Grid templateColumns={{ base: "1fr", md: "1.2fr 0.8fr 0.8fr 0.6fr" }} gap={3}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={subtleText} />
            </InputLeftElement>
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher hash / from / to / block..."
              fontSize="sm"
            />
          </InputGroup>

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            fontSize="sm"
          >
            <option value="all">Tous les types</option>
            <option value="deploy">Contract creation</option>
            <option value="call">Function call</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            fontSize="sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </Select>

          <Input
            value={minEth}
            onChange={(e) => {
              setMinEth(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Min ETH"
            fontSize="sm"
            inputMode="decimal"
          />
        </Grid>

        {/* Empty after filter */}
        {filtered.length === 0 ? (
          <Box
            p={10}
            bg="whiteAlpha.50"
            borderRadius="2xl"
            border="1px dashed"
            borderColor={borderColor}
            textAlign="center"
          >
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              Aucun résultat avec ces filtres.
            </Text>
          </Box>
        ) : (
          <>
            <Accordion allowMultiple>
              <VStack align="stretch" spacing={3}>
                {currentItems.map((tx) => (
                  <TransactionItem key={tx.hash} tx={tx} explorerBaseUrl={explorer} />
                ))}
              </VStack>
            </Accordion>

            {/* Pagination */}
            {totalPages > 1 && (
              <Flex justify="space-between" align="center" pt={2}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  Page {currentPage} sur {totalPages}
                </Text>
                <HStack>
                  <IconButton
                    aria-label="Page précédente"
                    icon={<ChevronLeftIcon />}
                    size="sm"
                    onClick={handlePrev}
                    isDisabled={currentPage === 1}
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Page suivante"
                    icon={<ChevronRightIcon />}
                    size="sm"
                    onClick={handleNext}
                    isDisabled={currentPage === totalPages}
                    variant="ghost"
                  />
                </HStack>
              </Flex>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}

function TransactionItem({
  tx,
  explorerBaseUrl,
}: {
  tx: TxInfo;
  explorerBaseUrl: string;
}) {
  const hash = tx.hash ?? "";
  const { hasCopied, onCopy } = useClipboard(hash);

  const itemBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const expandedBg = useColorModeValue("white", "blackAlpha.400");
  const subInfoColor = useColorModeValue("gray.600", "gray.300");

  const accentColor = tx.type === "deploy" ? "purple.400" : "cyan.400";

  const status = (tx as any).status as TxStatus;
  const effectiveStatus: Exclude<TxStatus, undefined> = (status ?? "pending") as any;

  const statusColorScheme =
    effectiveStatus === "success" ? "green" : effectiveStatus === "failed" ? "red" : "yellow";

  const safeValueEth = tx.value ? ethers.formatEther(tx.value) : "0";
  const gasUsedStr = tx.gasUsed ? tx.gasUsed.toString() : "—";
  const gasPriceGwei = tx.gasPrice ? ethers.formatUnits(tx.gasPrice, "gwei") : "—";

  // Optional fee calc if both present
  let feeEth: string | null = null;
  try {
    if (tx.gasUsed && tx.gasPrice) {
      const fee = tx.gasUsed * tx.gasPrice; // bigint
      feeEth = ethers.formatEther(fee);
    }
  } catch {
    feeEth = null;
  }

  const valueColor = tx.value && tx.value > 0n ? "orange.400" : "gray.500";

  return (
    <AccordionItem border="none" bg={itemBg} borderRadius="xl" overflow="hidden" mb={2}>
      <AccordionButton p={4} _hover={{ bg: "whiteAlpha.100" }}>
        <Flex justify="space-between" align="center" w="full" gap={3}>
          <HStack spacing={3} flexWrap="wrap">
            <Badge colorScheme={tx.type === "deploy" ? "purple" : "cyan"} variant="solid" fontSize="9px" px={2}>
              {tx.type === "deploy" ? "CONTRACT CREATION" : "FUNCTION CALL"}
            </Badge>

            <Badge colorScheme={statusColorScheme} variant="subtle" fontSize="9px" px={2} borderRadius="full">
              {effectiveStatus.toUpperCase()}
            </Badge>

            <HStack color={subInfoColor} fontSize="xs" spacing={1}>
              <Icon as={FaCube} />
              <Text fontWeight="bold">Block {tx.blockNumber ?? "—"}</Text>
            </HStack>
          </HStack>

          <HStack spacing={4}>
            <Text fontSize="xs" fontWeight="bold" color={valueColor}>
              {safeValueEth} ETH
            </Text>
            <AccordionIcon />
          </HStack>
        </Flex>
      </AccordionButton>

      <AccordionPanel pb={4} bg={expandedBg} borderTop="1px solid" borderColor="whiteAlpha.100">
        <VStack align="stretch" spacing={4}>
          {/* From/To */}
          <Box bg="blackAlpha.300" p={4} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
            <Grid templateColumns={{ base: "1fr", md: "1fr auto 1fr" }} gap={4} alignItems="center">
              <VStack align={{ base: "start", md: "start" }} spacing={1}>
                <HStack fontSize="9px" color="gray.500" fontWeight="bold">
                  <Icon as={FaWallet} /> <Text>EXPÉDITEUR</Text>
                </HStack>
                <Text fontSize="xs" fontFamily="mono" fontWeight="bold">
                  {(tx.from ?? "—").slice(0, 18)}...
                </Text>
              </VStack>

              <Flex justify="center" align="center" display={{ base: "none", md: "flex" }}>
                <Icon as={FaArrowRight} color="gray.600" />
              </Flex>

              <VStack align={{ base: "start", md: "end" }} spacing={1}>
                <HStack fontSize="9px" color="gray.500" fontWeight="bold">
                  <Text>{tx.type === "deploy" ? "CRÉATION" : "DESTINATAIRE"}</Text>
                  <Icon as={FaFileContract} />
                </HStack>
                <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color={accentColor}>
                  {tx.to ? `${tx.to.slice(0, 18)}...` : "New Smart Contract"}
                </Text>
              </VStack>
            </Grid>
          </Box>

          {/* Stats */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
            <Stat size="sm">
              <StatLabel fontSize="9px" color="gray.500">
                GAS USED
              </StatLabel>
              <StatNumber fontSize="xs">{gasUsedStr}</StatNumber>
            </Stat>

            <Stat size="sm">
              <StatLabel fontSize="9px" color="gray.500">
                GAS PRICE
              </StatLabel>
              <StatNumber fontSize="xs">{gasPriceGwei} Gwei</StatNumber>
            </Stat>

            <Stat size="sm">
              <StatLabel fontSize="9px" color="gray.500">
                NONCE
              </StatLabel>
              <StatNumber fontSize="xs">{tx.nonce ?? "—"}</StatNumber>
            </Stat>

            <Stat size="sm">
              <StatLabel fontSize="9px" color="gray.500">
                TX FEE
              </StatLabel>
              <StatNumber fontSize="xs">{feeEth ? `${feeEth} ETH` : "—"}</StatNumber>
            </Stat>
          </Grid>

          <Divider borderColor="whiteAlpha.100" />

          {/* Hash + actions */}
          <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
            <HStack>
              <Text fontSize="10px" fontFamily="mono" color="gray.500">
                {hash ? `${hash.slice(0, 20)}...` : "no-hash"}
              </Text>
              <IconButton
                aria-label="copy"
                icon={hasCopied ? <CheckIcon color="green.400" /> : <CopyIcon />}
                size="xs"
                variant="ghost"
                onClick={onCopy}
                isDisabled={!hash}
              />
            </HStack>

            <Link
              href={`${explorerBaseUrl}/tx/${hash}`}
              isExternal
              fontSize="xs"
              color="purple.400"
              fontWeight="bold"
            >
              View on Explorer <ExternalLinkIcon mx="2px" />
            </Link>
          </Flex>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
