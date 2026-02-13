"use client";

import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  useColorModeValue,
  Badge,
  HStack,
  Divider,
  Code,
  Icon,
} from "@chakra-ui/react";
import { FaBolt } from "react-icons/fa";
import { ethers } from "ethers";

interface ContractEventsPanelProps {
  contract: ethers.Contract | null;
  accentColor?: string;
}

interface EventItem {
  name: string;
  args: any[];
  txHash: string;
  blockNumber: number;
}

export default function ContractEventsPanel({
  contract,
  accentColor = "#805AD5",
}: ContractEventsPanelProps) {
  const [events, setEvents] = useState<EventItem[]>([]);

  const panelBg = useColorModeValue("white", "rgba(22,22,29,0.8)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // 🔥 Charger anciens events
  useEffect(() => {
    if (!contract) return;

    const loadPastEvents = async () => {
      try {
        const latestBlock = await contract.runner?.provider?.getBlockNumber();
        if (!latestBlock) return;

        const logs = await contract.queryFilter("*", latestBlock - 200);

        const formatted = logs.map((log: any) => ({
          name: log.fragment?.name || "Event",
          args: Object.values(log.args || []),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        }));

        setEvents(formatted.reverse());
      } catch (error) {
        console.error("Erreur chargement events:", error);
      }
    };

    loadPastEvents();
  }, [contract]);

  // ⚡ Listener live
  useEffect(() => {
    if (!contract) return;

    const listener = (...args: any[]) => {
      const event = args[args.length - 1];

      const newEvent: EventItem = {
        name: event.fragment?.name || "Event",
        args: Object.values(event.args || []),
        txHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber,
      };

      setEvents((prev) => [newEvent, ...prev]);
    };

    contract.on("*", listener);

    return () => {
      contract.removeAllListeners();
    };
  }, [contract]);

  if (!contract) {
    return (
      <Box
        p={6}
        bg={panelBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        textAlign="center"
      >
        <Text fontSize="sm" opacity={0.5}>
          Aucun contrat actif
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      bg={panelBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
    >
      <HStack justify="space-between" mb={4}>
        <HStack>
          <Icon as={FaBolt} color={accentColor} />
          <Heading size="xs" letterSpacing="widest">
            EVENTS LOG
          </Heading>
        </HStack>

        <Badge colorScheme="purple" variant="subtle">
          {events.length} events
        </Badge>
      </HStack>

      <Divider mb={4} borderColor={borderColor} />

      <VStack align="stretch" spacing={3}>
        {events.length === 0 && (
          <Text fontSize="sm" color={subtleText}>
            Aucun événement émis pour cette instance
          </Text>
        )}

        {events.map((e, index) => (
          <Box
            key={index}
            p={4}
            borderRadius="lg"
            bg="blackAlpha.300"
            border="1px solid"
            borderColor="whiteAlpha.100"
            fontSize="xs"
          >
            <HStack justify="space-between" mb={2}>
              <Badge colorScheme="purple">{e.name}</Badge>
              <Text opacity={0.6}>Block #{e.blockNumber}</Text>
            </HStack>

            {e.args.map((arg, i) => (
              <Text key={i} fontFamily="mono">
                Arg {i}: <Code>{String(arg)}</Code>
              </Text>
            ))}

            <Text fontSize="10px" opacity={0.5} mt={2}>
              {e.txHash.slice(0, 14)}...
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
