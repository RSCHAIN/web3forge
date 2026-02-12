"use client";

import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Icon, 
  Flex, 
  Tooltip, 
  useColorModeValue 
} from "@chakra-ui/react";
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
  // On considère l'interaction active si on est en train de traiter ou si c'est confirmé
  const isInteracting = txStatus !== "idle" || isDeployed;
  const hasMutated = txStatus === "confirmed";

  // 🎨 Couleurs dynamiques pour le mode jour
  const inactiveStepBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const connectorBg = useColorModeValue("gray.200", "whiteAlpha.200");
  const labelColor = useColorModeValue("gray.800", "white");
  const subLabelColor = useColorModeValue("gray.500", "gray.500");
  const headingColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box 
      bg={colors.panel} 
      p={6} 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor={colors.border}
      boxShadow={useColorModeValue("sm", "none")}
    >
      <HStack mb={10} spacing={3}>
        <Icon as={FiActivity} color="orange.400" />
        <Heading size="xs" letterSpacing="widest" textTransform="uppercase" color={headingColor}>
          Cycle de vie : Du Code à la Blockchain
        </Heading>
      </HStack>

      <Flex justify="space-between" align="center" position="relative" px={4}>
        
        {/* ÉTAPE 1: DÉPLOIEMENT */}
        <VStack flex="1" zIndex={2}>
          <Tooltip label="L'envoi unique de votre code sur le réseau." hasArrow>
            <Flex 
              boxSize="48px" 
              bg={isDeployed ? "blue.500" : inactiveStepBg} 
              borderRadius="full" 
              align="center" 
              justify="center"
              transition="all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              boxShadow={isDeployed ? "0 0 20px rgba(66, 153, 225, 0.4)" : "none"}
              cursor="help"
            >
              <Icon as={FiPlusCircle} color={isDeployed ? "white" : "gray.400"} boxSize={5} />
            </Flex>
          </Tooltip>
          <VStack spacing={0} mt={3}>
            <Text fontSize="10px" fontWeight="black" color={isDeployed ? labelColor : "gray.400"}>DÉPLOIEMENT</Text>
            <Text fontSize="9px" color={subLabelColor} fontWeight="bold">Mise en service</Text>
          </VStack>
        </VStack>

        {/* CONNECTEUR 1 */}
        <Box 
          h="2px" 
          flex="1" 
          bg={isDeployed ? "blue.500" : connectorBg} 
          mx={-1} 
          mb={10} 
          transition="all 0.6s" 
        />

        {/* ÉTAPE 2: INTERACTION */}
        <VStack flex="1" zIndex={2}>
          <Tooltip label="Chaque mise à jour est une requête signée envoyée au réseau." hasArrow>
            <Flex 
              boxSize="48px" 
              bg={hasMutated ? "purple.500" : (isDeployed ? "purple.200" : inactiveStepBg)} 
              _dark={{ bg: hasMutated ? "purple.500" : (isDeployed ? "purple.900" : inactiveStepBg) }}
              borderRadius="full" 
              align="center" 
              justify="center"
              transition="all 0.6s"
              boxShadow={hasMutated ? "0 0 20px rgba(159, 122, 234, 0.4)" : "none"}
              cursor="help"
            >
              <Icon as={FiZap} color={hasMutated || isDeployed ? (useColorModeValue("purple.700", "white")) : "gray.400"} boxSize={5} />
            </Flex>
          </Tooltip>
          <VStack spacing={0} mt={3}>
            <Text fontSize="10px" fontWeight="black" color={isInteracting ? labelColor : "gray.400"}>INTERACTION</Text>
            <Text fontSize="9px" color={subLabelColor} fontWeight="bold">Appels fonctions</Text>
          </VStack>
        </VStack>

        {/* CONNECTEUR 2 */}
        <Box 
          h="2px" 
          flex="1" 
          bg={hasMutated ? "purple.500" : connectorBg} 
          mx={-1} 
          mb={10} 
          transition="all 0.6s" 
        />

        {/* ÉTAPE 3: PERSISTANCE */}
        <VStack flex="1" zIndex={2}>
          <Tooltip label="Vos données sont gravées dans le registre décentralisé." hasArrow>
            <Flex 
              boxSize="48px" 
              bg={hasMutated ? "green.500" : inactiveStepBg} 
              borderRadius="full" 
              align="center" 
              justify="center"
              transition="all 0.6s"
              boxShadow={hasMutated ? "0 0 20px rgba(72, 187, 120, 0.4)" : "none"}
              cursor="help"
            >
              <Icon as={FiDatabase} color={hasMutated ? "white" : "gray.400"} boxSize={5} />
            </Flex>
          </Tooltip>
          <VStack spacing={0} mt={3}>
            <Text fontSize="10px" fontWeight="black" color={hasMutated ? labelColor : "gray.400"}>PERSISTANCE</Text>
            <Text fontSize="9px" color={subLabelColor} fontWeight="bold">Stockage immuable</Text>
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
}