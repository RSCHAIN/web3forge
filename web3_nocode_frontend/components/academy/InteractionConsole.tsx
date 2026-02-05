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
} from "@chakra-ui/react";
import { FiZap, FiRefreshCcw } from "react-icons/fi";

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
  return (
    <Card
      bg={colors.panel}
      border="1px solid"
      borderColor={colors.accent}
      borderRadius="2xl"
    >
      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          {/* 🧠 MODE NON DÉPLOYÉ */}
          {!isDeployed && (
            <>
              <Text fontSize="sm" color="gray.400">
                Ce smart contract contient :
                <br />• une <Code>variable</Code> de stockage  
                <br />• une <Code>fonction</Code> modifiant son état
              </Text>

              <Text fontSize="xs" color="gray.500">
                Commence par le déployer pour l’exécuter sur la blockchain.
              </Text>

              <Button
                colorScheme="purple"
                size="lg"
                leftIcon={<FiZap />}
                onClick={handleDeploy}
              >
                🚀 Déployer HelloStorage
              </Button>
            </>
          )}

          {/* ✅ MODE DÉPLOYÉ */}
          {isDeployed && (
            <>
              {/* 📦 VARIABLE */}
              <Box
                bg="black"
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <Text fontSize="xs" color="gray.500">
                  Variable Solidity
                </Text>

                <Code colorScheme="purple" fontSize="sm">
                  string public message
                </Code>

                <Divider my={3} />

                <Text fontSize="xs" color="gray.500">
                  Valeur actuelle stockée dans le contrat
                </Text>

                <Text
                  color="green.300"
                  fontWeight="bold"
                  fontSize="lg"
                  textAlign="center"
                  fontFamily="mono"
                >
                  message = "{currentMessage}"
                </Text>
              </Box>

              {/* 🔧 FONCTION */}
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Fonction appelée
                </Text>

                <Code colorScheme="purple" fontSize="sm">
                  setMessage(string newMessage)
                </Code>
              </Box>

              {/* ✍️ INPUT */}
              <FormControl>
                <FormLabel fontSize="10px" color="gray.500">
                  Nouvelle valeur de <Code>message</Code>
                </FormLabel>

                <Input
                  placeholder='ex: "Salut Web3 👋"'
                  bg="black"
                  border="none"
                  color="white"
                  _focus={{
                    border: "1px solid",
                    borderColor: colors.accent,
                  }}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </FormControl>

              {/* 🚀 ACTION */}
              <Button
                colorScheme="purple"
                w="full"
                leftIcon={<FiZap />}
                isLoading={isProcessing}
                onClick={handleUpdate}
              >
                Appeler setMessage(...)
              </Button>

              {/* 🧠 EXPLICATION */}
              <Text fontSize="xs" color="gray.500">
                Cette action ouvre MetaMask pour signer une transaction qui
                modifie l’état du smart contract sur la blockchain.
              </Text>

              <Divider />

              {/* 🔁 REDEPLOY */}
              <Button
                variant="outline"
                colorScheme="purple"
                leftIcon={<FiRefreshCcw />}
                onClick={handleDeploy}
              >
                🔁 Redéployer (nouvelle instance)
              </Button>

              <Text fontSize="xs" color="gray.500">
                Redéployer crée une <b>nouvelle instance</b> du même contrat,
                avec sa propre adresse et son propre état.
              </Text>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
