"use client";

import {
  Box,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Tooltip,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLink, FaCube } from "react-icons/fa";
import { useMemo } from "react";
import { TxInfo } from "./types/txinfo";

interface Props {
  transactions: TxInfo[];
}

export default function BlockchainVisualizer({ transactions }: Props) {
  const lineColor = useColorModeValue("purple.100", "whiteAlpha.200");
  const blockBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // 🕒 Format heure
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 🔥 Reconstruction optimisée O(n)
  const chain = useMemo(() => {
    if (!transactions.length) return [];

    const blockMap = new Map<
      number,
      { txs: TxInfo[]; timestamp?: number }
    >();

    for (const tx of transactions) {
      if (!blockMap.has(tx.blockNumber)) {
        blockMap.set(tx.blockNumber, {
          txs: [],
          timestamp: tx.timestamp,
        });
      }

      blockMap.get(tx.blockNumber)!.txs.push(tx);

      if (!blockMap.get(tx.blockNumber)!.timestamp && tx.timestamp) {
        blockMap.get(tx.blockNumber)!.timestamp = tx.timestamp;
      }
    }

    const blockNumbers = Array.from(blockMap.keys());
    const maxBlock = Math.max(...blockNumbers);
    const minBlock = Math.max(1, maxBlock - 7);

    const result = [];

    for (let i = minBlock; i <= maxBlock; i++) {
      const blockData = blockMap.get(i);

      result.push({
        number: i,
        txs: blockData?.txs || [],
        timestamp: blockData?.timestamp,
        isLatest: i === maxBlock,
      });
    }

    return result;
  }, [transactions]);

  if (!transactions.length) {
    return (
      <Box textAlign="center" py={10} opacity={0.5}>
        <Text fontSize="sm">Aucune activité blockchain détectée</Text>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      py={10}
      px={4}
      overflowX="auto"
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
    >
      <HStack spacing={0} align="center" minW="max-content" justify="center">
        <AnimatePresence mode="popLayout">
          {chain.map((block, index) => {
            const hasActivity = block.txs.length > 0;
            const hasDeploy = block.txs.some((t) => t.type === "deploy");
            const hasWrite = block.txs.some((t) => t.type === "write");

            const accentColor = !hasActivity
              ? "gray.300"
              : hasDeploy && hasWrite
              ? "orange.400"
              : hasDeploy
              ? "purple.400"
              : "cyan.400";

            const tooltipLabel = hasActivity
              ? `${block.txs.length} transaction(s)
${hasDeploy ? "• Deploy" : ""}
${hasWrite ? "• Call" : ""}`
              : "Bloc vide";

            return (
              <HStack key={block.number} spacing={0} align="center">
                {index > 0 && (
                  <Box w="30px" h="2px" bg={lineColor} position="relative">
                    <Icon
                      as={FaLink}
                      position="absolute"
                      left="50%"
                      top="50%"
                      transform="translate(-50%, -50%)"
                      color={lineColor}
                      boxSize={2}
                    />
                  </Box>
                )}

                <Tooltip label={tooltipLabel} hasArrow>
                  <Box position="relative">
                    {hasActivity && (
                      <Badge
                        position="absolute"
                        top="-10px"
                        right="-10px"
                        variant="solid"
                        colorScheme={
                          hasDeploy && hasWrite
                            ? "orange"
                            : hasDeploy
                            ? "purple"
                            : "cyan"
                        }
                        borderRadius="full"
                        zIndex={2}
                        fontSize="xs"
                      >
                        {block.txs.length}
                      </Badge>
                    )}

                    <motion.div
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={
                        block.isLatest && hasActivity
                          ? { scale: [1, 1.05, 1], opacity: 1 }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        duration: 0.6,
                      }}
                    >
                      <VStack
                        spacing={1}
                        w="80px"
                        h="80px"
                        bg={blockBg}
                        border="2px solid"
                        borderColor={hasActivity ? accentColor : lineColor}
                        borderRadius="2xl"
                        justify="center"
                        boxShadow={
                          block.isLatest && hasActivity
                            ? `0 0 20px ${accentColor}44`
                            : "none"
                        }
                        opacity={hasActivity ? 1 : 0.4}
                      >
                        <Icon as={FaCube} color={accentColor} boxSize={5} />

                        <Text
                          fontSize="xs"
                          fontWeight="black"
                          color={textColor}
                        >
                          #{block.number}
                        </Text>

                        {block.timestamp && (
                          <Text fontSize="10px" color="gray.400">
                            {formatTime(block.timestamp)}
                          </Text>
                        )}
                      </VStack>
                    </motion.div>
                  </Box>
                </Tooltip>
              </HStack>
            );
          })}
        </AnimatePresence>

        {/* Bloc pending animé */}
        <HStack spacing={0} ml={4}>
          <Box
            w="30px"
            h="2px"
            borderBottom="2px dashed"
            borderColor={lineColor}
          />
          <motion.div
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Box
              w="70px"
              h="70px"
              border="2px dashed"
              borderColor={lineColor}
              borderRadius="xl"
            />
          </motion.div>
        </HStack>
      </HStack>
    </Box>
  );
}
