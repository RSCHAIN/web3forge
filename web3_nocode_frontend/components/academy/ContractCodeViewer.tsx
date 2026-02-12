"use client";

import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  Badge, 
  Tooltip, 
  chakra, 
  shouldForwardProp, 
  useColorModeValue 
} from "@chakra-ui/react";
import { FiBook, FiDatabase, FiZap, FiKey } from "react-icons/fi";
import { motion, isValidMotionProp } from "framer-motion";

// Wrapper pour l'animation au survol des mots-clés
const ClickableCode = chakra(motion.span, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

export default function ContractCodeViewer({ colors }: any) {
  // 🎨 Palette adaptative pour la syntaxe
  const syntax = {
    keyword: useColorModeValue("purple.600", "purple.300"),
    variable: useColorModeValue("blue.600", "blue.300"),
    type: useColorModeValue("teal.600", "teal.300"),
    comment: useColorModeValue("gray.400", "gray.600"),
    text: useColorModeValue("gray.800", "white"),
    storageLine: useColorModeValue("blue.50", "whiteAlpha.100"),
    codeBg: useColorModeValue("white", "#000000"),
  };

  const interactiveStyles = {
    cursor: "pointer",
    borderBottom: "1px dashed",
    borderColor: useColorModeValue("gray.300", "whiteAlpha.400"),
    px: "2px",
    borderRadius: "sm",
    _hover: { 
      bg: useColorModeValue("purple.50", "whiteAlpha.200"), 
      color: syntax.keyword,
      borderColor: syntax.keyword 
    }
  };

  return (
    <Box 
      bg={colors.panel} 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor={colors.border} 
      overflow="hidden"
      boxShadow={useColorModeValue("sm", "none")}
    >
      {/* HEADER : Titre de l'explorateur */}
      <Box bg={useColorModeValue("gray.50", "whiteAlpha.100")} px={6} py={3} borderBottom="1px solid" borderColor={colors.border}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FiBook} color="blue.400" />
            <Text fontSize="10px" fontWeight="black" letterSpacing="widest" color={useColorModeValue("gray.600", "gray.400")}>
              LOGIQUE DU CONTRAT (INTERACTIF)
            </Text>
          </HStack>
          <Badge colorScheme="blue" variant="subtle" fontSize="9px" borderRadius="full" px={2}>
            Solidity v0.8
          </Badge>
        </HStack>
      </Box>

      {/* ZONE DE CODE : Stylisée comme un IDE */}
      <Box p={6} bg={syntax.codeBg} fontFamily="'Fira Code', 'Courier New', monospace" fontSize="13px" lineHeight="1.8">
        <VStack align="flex-start" spacing={0}>
          <Text color={syntax.comment} mb={2}>// Touchez les mots pour comprendre la blockchain</Text>
          
          <Text color={syntax.text}>
            <Text as="span" color={syntax.keyword}>contract</Text>{" "}
            <Tooltip label="C'est le nom de votre programme. Comme un fichier ou une classe." hasArrow>
               <ClickableCode whileHover={{ scale: 1.05 }} {...interactiveStyles}>HelloStorage</ClickableCode>
            </Tooltip>{" {"}
          </Text>
          
          {/* LIGNE DE STOCKAGE : Mise en évidence */}
          <Box w="full" bg={syntax.storageLine} px={2} borderLeft="3px solid" borderColor="blue.400" my={2} py={1}>
            <Text color={syntax.text}>
              <Tooltip label="'string' : Type de donnée pour stocker du texte." hasArrow>
                <ClickableCode color={syntax.variable} {...interactiveStyles}>string</ClickableCode>
              </Tooltip>{" "}
              <Tooltip label="'public' : Crée automatiquement une fonction pour lire la valeur." hasArrow>
                <ClickableCode color={syntax.type} {...interactiveStyles}>public</ClickableCode>
              </Tooltip>{" "}
              <Tooltip label="'message' : C'est le nom de l'emplacement mémoire sur la blockchain." hasArrow>
                <ClickableCode fontWeight="bold" {...interactiveStyles}>message</ClickableCode>
              </Tooltip>;
              <Badge ml={3} colorScheme="blue" fontSize="8px" variant="outline">STORAGE</Badge>
            </Text>
          </Box>

          {/* CONSTRUCTEUR */}
          <Text mt={2} color={syntax.text}>
            <Tooltip label="S'exécute une seule fois lors de la création (déploiement)." hasArrow>
              <ClickableCode color={syntax.keyword} {...interactiveStyles}>constructor</ClickableCode>
            </Tooltip>
            (string <Text as="span" color={syntax.type}>memory</Text> _init) {"{"}
          </Text>
          <Text ml={6} color={syntax.text}>
            <Tooltip label="On initialise la variable d'état avec la valeur fournie." hasArrow>
               <ClickableCode {...interactiveStyles}>message = _init;</ClickableCode>
            </Tooltip>
          </Text>
          <Text color={syntax.text}>{"}"}</Text>

          {/* FONCTION SETMESSAGE */}
          <Text mt={4} color={syntax.text}>
            <Tooltip label="'function' : Définit une action capable de modifier la blockchain." hasArrow>
              <ClickableCode color={syntax.keyword} {...interactiveStyles}>function</ClickableCode>
            </Tooltip>{" "}
            <ClickableCode {...interactiveStyles}>setMessage</ClickableCode>
            (string <Text as="span" color={syntax.type}>memory</Text> _new) {" "}
            <Tooltip label="'external' : Cette fonction peut être appelée depuis votre wallet." hasArrow>
              <ClickableCode color={syntax.type} {...interactiveStyles}>external</ClickableCode>
            </Tooltip> {"{"}
          </Text>
          
          <Box ml={6} borderLeft="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} pl={4}>
             <Text color={syntax.text}>
               <Tooltip label="Chaque changement ici coûte un peu de Gas." hasArrow>
                 <ClickableCode {...interactiveStyles}>message = _new;</ClickableCode>
               </Tooltip>
             </Text>
          </Box>
          <Text color={syntax.text}>{"}"}</Text>
          
          <Text mt={2} color={syntax.text}>{"}"}</Text>
        </VStack>
      </Box>

      {/* LÉGENDE PÉDAGOGIQUE */}
      <Box bg={useColorModeValue("gray.50", "whiteAlpha.50")} p={3} borderTop="1px solid" borderColor={colors.border}>
        <HStack spacing={6} justify="center">
          <HStack spacing={1}>
            <Icon as={FiDatabase} color="blue.400" boxSize={3}/>
            <Text fontSize="9px" fontWeight="bold" color={useColorModeValue("gray.600", "gray.400")}>STOCKAGE D'ÉTAT</Text>
          </HStack>
          <HStack spacing={1}>
            <Icon as={FiZap} color="purple.400" boxSize={3}/>
            <Text fontSize="9px" fontWeight="bold" color={useColorModeValue("gray.600", "gray.400")}>MUTATION (GAS)</Text>
          </HStack>
          <HStack spacing={1}>
            <Icon as={FiKey} color="teal.400" boxSize={3}/>
            <Text fontSize="9px" fontWeight="bold" color={useColorModeValue("gray.600", "gray.400")}>ACCÈS</Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}