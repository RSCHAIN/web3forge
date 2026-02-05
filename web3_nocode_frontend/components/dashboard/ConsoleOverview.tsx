"use client";

import { 
  Box, Heading, Text, VStack, Icon, SimpleGrid, 
  Card, CardBody, Flex, useColorModeValue, Badge,
  Divider, HStack, List, ListItem, ListIcon, Progress
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiLayout, FiZap, FiBox, FiUser, FiActivity, 
  FiClock, FiArrowRight, FiCheckCircle, FiGlobe 
} from "react-icons/fi";

const MotionBox = motion(Box);

interface ConsoleOverviewProps {
  address: string | undefined;
  deploymentsCount: number;
  network: string;
}

export default function ConsoleOverview({ address, deploymentsCount, network }: ConsoleOverviewProps) {
  const textColor = useColorModeValue("gray.900", "white");
  const secondaryColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const headerBg = useColorModeValue("white", "whiteAlpha.50");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      
      {/* --- TOP STATS: CORE METRICS --- */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <StatCard label="Native Balance" value="10,000 ETH" icon={FiZap} trend="+0.2% vs last block" />
        <StatCard label="Active Deployments" value={deploymentsCount.toString()} icon={FiBox} subtitle="ERC-20 Standard" />
        <StatCard label="Network Identity" value={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Disconnected"} icon={FiUser} subtitle={`Verified on ${network}`} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
        
        {/* --- LEFT: NETWORK STATUS & QUICK START (7/12) --- */}
        <VStack align="stretch" spacing={6} gridColumn={{ lg: "span 7" }}>
          <Card variant="outline" borderRadius="3xl" bg={headerBg} borderColor={cardBorder} p={8}>
            <VStack align="flex-start" spacing={6}>
              <HStack w="full" justify="space-between">
                <HStack>
                  <Icon as={FiGlobe} color="purple.500" />
                  <Heading size="xs" textTransform="uppercase" letterSpacing="widest">Environment Engine</Heading>
                </HStack>
                <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3}>
                  Node: {network.toUpperCase()}
                </Badge>
              </HStack>
              
              <Text color={secondaryColor} fontSize="sm">
                Your console is currently interfacing with the <b>Ethereum Virtual Machine</b> via the {network} gateway. 
                All operations are atomic and follow the EIP-20 standard specifications.
              </Text>

              <SimpleGrid columns={2} w="full" spacing={6}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="10px" fontWeight="black" color="gray.400">SYNC STATUS</Text>
                  <HStack>
                    <Icon as={FiCheckCircle} color="green.400" />
                    <Text fontSize="xs" fontWeight="bold">100% Finalized</Text>
                  </HStack>
                </VStack>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="10px" fontWeight="black" color="gray.400">LATENCY</Text>
                  <HStack>
                    <Icon as={FiClock} color="blue.400" />
                    <Text fontSize="xs" fontWeight="bold">12ms (Localhost)</Text>
                  </HStack>
                </VStack>
              </SimpleGrid>

              <Divider />

              <Button 
                rightIcon={<FiArrowRight />} 
                colorScheme="purple" 
                variant="link" 
                size="sm"
                onClick={() => {/* Trigger Tour */}}
              >
                Start System Diagnostic
              </Button>
            </VStack>
          </Card>

          {/* RESOURCE USAGE SIMULATION */}
          <Card variant="outline" borderRadius="3xl" bg={headerBg} borderColor={cardBorder} p={6}>
             <VStack align="stretch" spacing={4}>
                <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="widest">GAS USAGE CAPACITY</Text>
                <Box>
                    <Flex justify="space-between" mb={1}>
                        <Text fontSize="xs" fontWeight="bold">Current Block Load</Text>
                        <Text fontSize="xs">42%</Text>
                    </Flex>
                    <Progress value={42} size="xs" colorScheme="purple" borderRadius="full" />
                </Box>
             </VStack>
          </Card>
        </VStack>

        {/* --- RIGHT: RECENT ACTIVITY (5/12) --- */}
        <VStack align="stretch" spacing={6} gridColumn={{ lg: "span 5" }}>
          <Card variant="outline" borderRadius="3xl" bg={headerBg} borderColor={cardBorder} p={6}>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Icon as={FiActivity} color="purple.500" />
                <Heading size="xs" textTransform="uppercase" letterSpacing="widest">System Events</Heading>
              </HStack>
              <Divider />
              <List spacing={4}>
                <ActivityItem label="Contract Compiled" time="2m ago" />
                <ActivityItem label="Token Minted" time="15m ago" />
                <ActivityItem label="Wallet Synchronized" time="1h ago" />
                <ActivityItem label="Anvil RPC Connected" time="2h ago" />
              </List>
            </VStack>
          </Card>

          <Box p={6} borderRadius="3xl" bg="purple.600" color="white" boxShadow="0 20px 40px rgba(128, 90, 213, 0.3)">
             <VStack align="flex-start" spacing={3}>
                <Icon as={FiZap} boxSize={6} />
                <Heading size="sm">Mastery Tip</Heading>
                <Text fontSize="xs" opacity={0.9}>
                    Use the <b>Edu Mode</b> switch to reveal the raw EVM Opcodes and Gas costs for every transaction.
                </Text>
             </VStack>
          </Box>
        </VStack>
      </SimpleGrid>
    </MotionBox>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon, trend, subtitle }: any) {
  const bg = useColorModeValue("white", "whiteAlpha.50");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  
  return (
    <Card variant="outline" bg={bg} borderColor={border} borderRadius="2xl" boxShadow="sm">
      <CardBody>
        <Flex align="center" justify="space-between">
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="10px" color="gray.400" fontWeight="black" textTransform="uppercase" letterSpacing="wider">{label}</Text>
            <Text fontSize="2xl" fontWeight="800" color={useColorModeValue("gray.900", "white")}>{value}</Text>
            {trend && <Text fontSize="10px" color="green.400" fontWeight="bold">{trend}</Text>}
            {subtitle && <Text fontSize="10px" color="gray.500">{subtitle}</Text>}
          </VStack>
          <Icon as={icon} boxSize={8} color="purple.500" opacity={0.3} />
        </Flex>
      </CardBody>
    </Card>
  );
}

function ActivityItem({ label, time }: { label: string; time: string }) {
    return (
        <ListItem>
            <Flex justify="space-between" align="center">
                <HStack>
                    <Box boxSize="6px" borderRadius="full" bg="purple.500" />
                    <Text fontSize="xs" fontWeight="bold">{label}</Text>
                </HStack>
                <Text fontSize="10px" color="gray.400">{time}</Text>
            </Flex>
        </ListItem>
    );
}

import { Button } from "@chakra-ui/react";