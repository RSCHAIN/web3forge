"use client";

import { Box, VStack, HStack, Text, Icon, Flex, useColorModeValue } from "@chakra-ui/react";
import { FiUser, FiPenTool, FiGlobe, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";

// Création d'un composant Flex animé avec Framer Motion
const MotionFlex = motion(Flex);

export default function TransactionFlow({ status }: { status: string }) {
  const steps = [
    { id: "signing", label: "Votre Accord", icon: FiUser, desc: "Validation wallet" },
    { id: "broadcast", label: "Envoi", icon: FiPenTool, desc: "Signature transmise" },
    { id: "validating", label: "Le Réseau", icon: FiGlobe, desc: "Vérification" },
    { id: "confirmed", label: "Gravé", icon: FiLock, desc: "État immuable" },
  ];

  // Couleurs dynamiques
  const bgBox = useColorModeValue("white", "rgba(22, 22, 29, 0.7)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const inactiveBg = useColorModeValue("gray.100", "gray.800");
  const activeLabel = useColorModeValue("gray.800", "white");
  const inactiveLabel = useColorModeValue("gray.400", "gray.600");
  const descColor = useColorModeValue("gray.500", "gray.500");

  const currentIdx = steps.findIndex(s => s.id === status);

  return (
    <Box 
      bg={bgBox} 
      p={6} 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor={borderColor}
      boxShadow={useColorModeValue("sm", "none")}
    >
      <Text fontSize="10px" fontWeight="black" color="gray.500" mb={8} letterSpacing="widest" textTransform="uppercase">
        Parcours d'une transaction
      </Text>

      <HStack spacing={0} justify="space-between" position="relative">
        {/* Ligne de fond pour connecter les étapes */}
        <Box 
          position="absolute" 
          top="20px" 
          left="10%" 
          right="10%" 
          h="2px" 
          bg={inactiveBg} 
          zIndex={0} 
        />

        {steps.map((step, idx) => {
          const isActive = status === step.id;
          const isCompleted = currentIdx > idx || status === "confirmed";
          const activeOrDone = isActive || isCompleted;

          return (
            <VStack key={step.id} flex="1" spacing={3} zIndex={1}>
              <MotionFlex 
                boxSize="40px" 
                borderRadius="full" 
                bg={activeOrDone ? "purple.500" : inactiveBg} 
                align="center" 
                justify="center"
                animate={isActive ? { scale: [1, 1.15, 1], boxShadow: "0 0 20px rgba(128, 90, 213, 0.6)" } : { scale: 1 }}
                transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
              >
                <Icon 
                  as={step.icon} 
                  color={activeOrDone ? "white" : "gray.500"} 
                  boxSize={4}
                />
              </MotionFlex>

              <VStack spacing={0} textAlign="center">
                <Text 
                  fontSize="10px" 
                  fontWeight="bold" 
                  color={activeOrDone ? activeLabel : inactiveLabel}
                  transition="color 0.3s"
                >
                  {step.label}
                </Text>
                <Text fontSize="9px" color={descColor} px={1} fontWeight="medium">
                  {step.desc}
                </Text>
              </VStack>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
}