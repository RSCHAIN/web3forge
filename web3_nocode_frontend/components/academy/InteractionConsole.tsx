"use client";

import {
  Box,
  VStack,
  Card,
  CardBody,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  Code,
  useColorModeValue,
  Icon,
  HStack,
  Heading,
} from "@chakra-ui/react";
import { FiZap, FiRefreshCcw, FiDatabase, FiSettings } from "react-icons/fi";

interface InteractionConsoleProps {
  currentMessage: string;
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleUpdate: () => Promise<void>;
  handleDeploy: () => Promise<void>;
  isProcessing: boolean;
  isDeployed: boolean;
  colors: {
    panel: string;
    accent: string;
    border: string;
  };
}

export default function InteractionConsole({
  currentMessage,
  newMessage,
  setNewMessage,
  handleUpdate,
  handleDeploy,
  isProcessing,
  isDeployed,
  colors,
}: InteractionConsoleProps) {
  // 🎨 Couleurs adaptatives
  const innerBoxBg = useColorModeValue("gray.50", "blackAlpha.400");
  const inputBg = useColorModeValue("white", "black");
  const inputBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const subTextColor = useColorModeValue("gray.600", "gray.500");
  const mainTextColor = useColorModeValue("gray.800", "white");
  const valueDisplayBg = useColorModeValue("purple.50", "whiteAlpha.50");
  const valueColor = useColorModeValue("purple.600", "green.300");

  return (
    <Card
      bg={colors.panel}
      border="1px solid"
      borderColor={colors.border}
      borderRadius="2xl"
      boxShadow="xl"
      overflow="hidden"
    >
      <Box bg={colors.accent} h="4px" />
      <CardBody p={6}>
        <VStack align="stretch" spacing={5}>
          {/* 🧠 EN-TÊTE CONSOLE */}
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiSettings} color={colors.accent} />
              <Heading size="xs" letterSpacing="widest" color={mainTextColor}>
                CONSOLE DE CONTRÔLE
              </Heading>
            </HStack>
          </HStack>

          {/* 🧠 MODE NON DÉPLOYÉ */}
          {!isDeployed && (
            <VStack align="stretch" spacing={4} py={4}>
              <Box p={4} bg={innerBoxBg} borderRadius="xl" border="1px dashed" borderColor={colors.border}>
                <Text fontSize="sm" color={mainTextColor} lineHeight="tall">
                  Ce smart contract contient :
                  <br />• une <Code colorScheme="purple">variable</Code> de stockage  
                  <br />• une <Code colorScheme="purple">fonction</Code> modifiant son état
                </Text>
              </Box>

              <Text fontSize="xs" color={subTextColor} textAlign="center">
                Commence par le déployer pour l’exécuter sur la blockchain.
              </Text>

              <Button
                colorScheme="purple"
                size="lg"
                h="60px"
                leftIcon={<FiZap />}
                onClick={handleDeploy}
                boxShadow="0 4px 14px 0 rgba(128, 90, 213, 0.39)"
              >
                🚀 Déployer HelloStorage
              </Button>
            </VStack>
          )}

          {/* ✅ MODE DÉPLOYÉ */}
          {isDeployed && (
            <>
              {/* 📦 VARIABLE STATE */}
              <Box
                bg={innerBoxBg}
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor={colors.border}
              >
                <HStack mb={2}>
                  <Icon as={FiDatabase} boxSize={3} color={subTextColor} />
                  <Text fontSize="10px" fontWeight="black" color={subTextColor} letterSpacing="wider">
                    ÉTAT DU CONTRAT
                  </Text>
                </HStack>

                <Code colorScheme="purple" fontSize="2xs" mb={3} variant="subtle">
                  string public message
                </Code>

                <Box
                  bg={valueDisplayBg}
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="purple.100"
                  _dark={{ borderColor: "whiteAlpha.100" }}
                >
                  <Text
                    color={valueColor}
                    fontWeight="bold"
                    fontSize="lg"
                    textAlign="center"
                    fontFamily="mono"
                  >
                    "{currentMessage}"
                  </Text>
                </Box>
              </Box>

              {/* 🔧 FONCTION & INPUT */}
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="10px" fontWeight="bold" color={subTextColor}>
                    FONCTION <Code fontSize="10px">setMessage(string)</Code>
                  </FormLabel>

                  <Input
                    placeholder='Entrez une nouvelle valeur...'
                    bg={inputBg}
                    h="50px"
                    border="1px solid"
                    borderColor={inputBorder}
                    color={mainTextColor}
                    _focus={{
                      borderColor: colors.accent,
                      boxShadow: `0 0 0 1px ${colors.accent}`,
                    }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </FormControl>

                <Button
                  colorScheme="purple"
                  w="full"
                  h="50px"
                  leftIcon={<FiZap />}
                  isLoading={isProcessing}
                  onClick={handleUpdate}
                  isDisabled={!newMessage}
                >
                  Envoyer la Transaction
                </Button>
              </VStack>

              <Divider borderColor={colors.border} />

              {/* 🔁 REDEPLOY ZONE */}
              <VStack align="stretch" spacing={3}>
                <Button
                  variant="outline"
                  size="sm"
                  colorScheme="gray"
                  leftIcon={<FiRefreshCcw />}
                  onClick={handleDeploy}
                  fontSize="xs"
                >
                  Nouveau Déploiement
                </Button>

                <Text fontSize="10px" color={subTextColor} textAlign="center" fontStyle="italic">
                  Crée une instance isolée avec sa propre adresse.
                </Text>
              </VStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}