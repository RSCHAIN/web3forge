"use client";

import { Box, VStack, HStack, Text, Icon, Flex } from "@chakra-ui/react";
import { FiUser, FiPenTool, FiGlobe, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";

export default function TransactionFlow({ status }: any) {
  const steps = [
    { id: "signing", label: "Votre Accord", icon: FiUser, desc: "Vous validez l'ordre" },
    { id: "broadcast", label: "Envoi", icon: FiPenTool, desc: "Signature transmise" },
    { id: "validating", label: "Le Réseau", icon: FiGlobe, desc: "Vérification mondiale" },
    { id: "confirmed", label: "Gravé", icon: FiLock, desc: "Coffre mis à jour" },
  ];

  const currentIdx = steps.findIndex(s => s.id === status);

  return (
    <Box bg="#16161D" p={6} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="10px" fontWeight="black" color="gray.500" mb={6} letterSpacing="widest">
        DÉCRYPTAGE : QUE SE PASSE-T-IL QUAND VOUS VALIDEZ ?
      </Text>

      

      <HStack spacing={0} justify="space-between">
        {steps.map((step, idx) => {
          const active = currentIdx >= idx || status === "confirmed";
          return (
            <VStack key={step.id} flex="1" spacing={3}>
              <Flex 
                boxSize="40px" borderRadius="full" 
                bg={active ? "purple.500" : "gray.800"} 
                align="center" justify="center"
                transition="all 0.5s"
                boxShadow={active ? "0 0 15px rgba(128, 90, 213, 0.4)" : "none"}
              >
                <Icon as={step.icon} color="white" />
              </Flex>
              <VStack spacing={0} textAlign="center">
                <Text fontSize="10px" fontWeight="bold" color={active ? "white" : "gray.600"}>{step.label}</Text>
                <Text fontSize="8px" color="gray.700" px={2}>{step.desc}</Text>
              </VStack>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
}