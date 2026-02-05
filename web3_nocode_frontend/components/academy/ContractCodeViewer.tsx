"use client";

import { Box, Text, VStack, HStack, Icon, Badge, Tooltip, chakra, shouldForwardProp } from "@chakra-ui/react";
import { FiBook, FiInfo, FiDatabase, FiZap, FiKey } from "react-icons/fi";
import { motion, isValidMotionProp } from "framer-motion";

// Un petit wrapper pour rendre le code cliquable et animé
const ClickableCode = chakra(motion.span, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

export default function ContractCodeViewer({ colors }: any) {
  const codeStyles = {
    keyword: "purple.400",
    variable: "blue.300",
    type: "teal.300",
    comment: "gray.600",
    interactive: {
      cursor: "pointer",
      borderBottom: "1px dashed",
      px: "2px",
      borderRadius: "sm",
      _hover: { bg: "whiteAlpha.200", color: "white" }
    }
  };

  return (
    <Box bg={colors.panel} borderRadius="2xl" border="1px solid" borderColor={colors.border} overflow="hidden">
      {/* HEADER */}
      <Box bg="whiteAlpha.100" px={6} py={3} borderBottom="1px solid" borderColor={colors.border}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FiBook} color="blue.400" />
            <Text fontSize="10px" fontWeight="black" letterSpacing="widest" color="gray.400">
              EXPLORATEUR DE RÈGLES (CLIQUEZ SUR LES MOTS)
            </Text>
          </HStack>
          <Badge colorScheme="blue" variant="outline" fontSize="9px">HELLOSTORAGE.SOL</Badge>
        </HStack>
      </Box>

      {/* ZONE DE CODE INTERACTIVE */}
      <Box p={6} bg={colors.code} fontFamily="mono" fontSize="13px" lineHeight="2">
        <VStack align="flex-start" spacing={0}>
          <Text color={codeStyles.comment}>// Cliquez sur les mots en couleur pour comprendre leur rôle.</Text>
          
          <Text>
            <Text as="span" color={codeStyles.keyword}>contract</Text>{" "}
            <Tooltip label="C'est le nom de votre programme. Comme une classe ou un moule." hasArrow>
               <ClickableCode whileHover={{ scale: 1.05 }} color="white" {...codeStyles.interactive}>HelloStorage</ClickableCode>
            </Tooltip>{" {"}
          </Text>
          
          {/* LIGNE VARIABLE */}
          <Box w="full" bg="blue.900" px={2} borderLeft="3px solid" borderColor="blue.400" my={3}>
            <Text>
              <Tooltip label="Type 'string' : Indique que nous stockons du texte (lettres, mots)." hasArrow>
                <ClickableCode color={codeStyles.variable} {...codeStyles.interactive}>string</ClickableCode>
              </Tooltip>{" "}
              <Tooltip label="'public' : Rend le message visible par tout le monde sur la blockchain." hasArrow>
                <ClickableCode color={codeStyles.type} {...codeStyles.interactive}>public</ClickableCode>
              </Tooltip>{" "}
              <Tooltip label="C'est l'étiquette de votre boîte de stockage." hasArrow>
                <ClickableCode color="white" fontWeight="bold" {...codeStyles.interactive}>message</ClickableCode>
              </Tooltip>;
              <Badge ml={3} colorScheme="blue" fontSize="8px" variant="solid">MÉMOIRE PERMANENTE</Badge>
            </Text>
          </Box>

          {/* CONSTRUCTEUR */}
          <Text mt={2}>
            <Tooltip label="Le Constructeur ne s'exécute QU'UNE SEULE FOIS, à la naissance du contrat." hasArrow>
              <ClickableCode color={codeStyles.keyword} {...codeStyles.interactive}>constructor</ClickableCode>
            </Tooltip>
            (string memory <ClickableCode color="white">initialMessage</ClickableCode>) {"{"}
          </Text>
          <Text ml={6} color="white">
            <Tooltip label="On dépose le message de départ dans notre boîte 'message'." hasArrow>
               <ClickableCode {...codeStyles.interactive}>message = initialMessage;</ClickableCode>
            </Tooltip>
          </Text>
          <Text>{"}"}</Text>

          {/* FONCTION SETMESSAGE */}
          <Text mt={4}>
            <Tooltip label="'function' définit une action que vous pouvez déclencher." hasArrow>
              <ClickableCode color={codeStyles.keyword} {...codeStyles.interactive}>function</ClickableCode>
            </Tooltip>{" "}
            <Tooltip label="Le nom de l'action pour changer le texte." hasArrow>
              <ClickableCode color="white" {...codeStyles.interactive}>setMessage</ClickableCode>
            </Tooltip>
            (string memory <ClickableCode color="white">newMessage</ClickableCode>){" "}
            <Tooltip label="'external' signifie que cette action est appelée depuis l'extérieur (par vous)." hasArrow>
              <ClickableCode color={codeStyles.type} {...codeStyles.interactive}>external</ClickableCode>
            </Tooltip> {"{"}
          </Text>
          
          <Box ml={6} borderLeft="1px solid" borderColor="whiteAlpha.300" pl={4}>
             <Text color="white">
               <Tooltip label="Ici, le nouveau texte remplace l'ancien de façon définitive." hasArrow>
                 <ClickableCode {...codeStyles.interactive}>message = newMessage;</ClickableCode>
               </Tooltip>
             </Text>
          </Box>
          <Text>{"}"}</Text>
          
          <Text mt={2}>{"}"}</Text>
        </VStack>
      </Box>

      {/* FOOTER D'AIDE */}
      <Box bg="whiteAlpha.50" p={3} borderTop="1px solid" borderColor={colors.border}>
        <HStack spacing={4} justify="center">
          <HStack spacing={1}><Icon as={FiDatabase} color="blue.400" boxSize={3}/><Text fontSize="9px">Donnée stockée</Text></HStack>
          <HStack spacing={1}><Icon as={FiZap} color="purple.400" boxSize={3}/><Text fontSize="9px">Action (Transaction)</Text></HStack>
          <HStack spacing={1}><Icon as={FiKey} color="teal.400" boxSize={3}/><Text fontSize="9px">Visibilité</Text></HStack>
        </HStack>
      </Box>
    </Box>
  );
}