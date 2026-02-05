"use client";

import {
  Box, VStack, HStack, Heading, Text, Icon, Divider, Button, IconButton, Spinner, useColorModeValue, Badge
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FiBookOpen, FiLayout, FiActivity, FiBox, FiPlus, FiChevronRight, FiLogOut, FiZap, FiLock } from "react-icons/fi";
import ColorModeToggle from "../theme/ColorModeToggle";

interface AcademySidebarProps {
  deployments: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean;
  tokenDetails: any;
  disconnect: () => void;
}

export function AcademySidebar({ deployments, activeTab, setActiveTab, loading, tokenDetails, disconnect }: AcademySidebarProps) {
  const router = useRouter();
  const sidebarBg = useColorModeValue("white", "whiteAlpha.50");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.900", "white");

  return (
    <Box w="320px" bg={sidebarBg} borderRight="1px solid" borderColor={cardBorder} p={6} h="100vh" position="sticky" top={0}>
      <VStack align="stretch" spacing={8}>
        {/* LOGO */}
        <HStack spacing={3} mb={4}>
          <Icon as={FiBookOpen} color="purple.500" boxSize={6} />
          <VStack align="flex-start" spacing={0}>
            <Heading size="sm" letterSpacing="tight" color={textColor}>Web3Forge</Heading>
            <Text fontSize="9px" fontWeight="black" color="purple.500" letterSpacing="0.2em">ACADEMY</Text>
          </VStack>
        </HStack>

        {/* NAVIGATION */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="10px" fontWeight="black" color="gray.400" mb={2} px={3} letterSpacing="0.1em">LEARNING CONSOLE</Text>
          <SidebarItem icon={FiLayout} label="Academy Overview" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <SidebarItem icon={FiActivity} label="Transaction Forensic" isActive={activeTab === "history"} onClick={() => setActiveTab("history")} />
        </VStack>

        {/* LEARNING LEVELS 0-6 */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="10px" fontWeight="black" color="gray.400" mt={4} mb={2} px={3} letterSpacing="0.1em">ACADEMY CHALLENGES</Text>
          <SidebarItem icon={FiZap} label="Level 0: Storage" subLabel="Basics" isActive={activeTab === "lvl0"} onClick={() => setActiveTab("lvl0")} />
          <SidebarItem icon={FiLock} label="Level 1: Events" subLabel="In progress" isActive={false} opacity={0.5} cursor="not-allowed" />
        </VStack>

        {/* LAB ASSETS */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="10px" fontWeight="black" color="gray.400" mt={4} mb={2} px={3} letterSpacing="0.1em">MY LAB ASSETS</Text>
          {loading ? <Spinner size="xs" ml={3} color="purple.500"/> : deployments.map((d) => (
            <SidebarItem 
              key={d.contract_address}
              icon={FiBox} 
              label={activeTab === d.contract_address && tokenDetails ? tokenDetails.name : (d.name || "Token Lab")} 
              subLabel={d.contract_address.slice(0, 10) + "..."}
              isActive={activeTab === d.contract_address} 
              onClick={() => setActiveTab(d.contract_address)} 
            />
          ))}
        </VStack>

        <Button leftIcon={<FiPlus />} mt={4} colorScheme="purple" size="md" borderRadius="xl" onClick={() => router.push("/deploy")}>
          New Deployment
        </Button>

        {/* FOOTER */}
        <Box mt="auto">
          <Divider mb={4} />
          <HStack justify="space-between">
            <ColorModeToggle />
            <Button variant="ghost" size="xs" onClick={() => router.push("/")} color={textColor}>Hub</Button>
            <IconButton aria-label="Logout" icon={<FiLogOut />} variant="ghost" colorScheme="red" onClick={() => { disconnect(); router.push("/"); }} />
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}

function SidebarItem({ icon, label, subLabel, isActive, onClick, ...props }: any) {
  const activeBg = useColorModeValue("purple.600", "purple.500");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const textColor = useColorModeValue(isActive ? "white" : "gray.600", "white");

  return (
    <HStack 
      px={4} py={3} borderRadius="xl" cursor="pointer"
      bg={isActive ? activeBg : "transparent"}
      color={textColor}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      onClick={onClick}
      transition="all 0.2s"
      {...props}
    >
      <Icon as={icon} boxSize={isActive ? 5 : 4} />
      <VStack align="flex-start" spacing={0} flex="1">
        <Text fontSize="sm" fontWeight={isActive ? "bold" : "medium"}>{label}</Text>
        {subLabel && <Text fontSize="10px" opacity={0.6} fontFamily="mono">{subLabel}</Text>}
      </VStack>
      {isActive && <Icon as={FiChevronRight} />}
    </HStack>
  );
}