"use client";

import { 
  Box, VStack, Card, CardBody, Text, FormControl, 
  FormLabel, Input, Button, HStack, Icon 
} from "@chakra-ui/react";
import { FiZap } from "react-icons/fi";

interface InteractionConsoleProps {
  currentMessage: string;
  newMessage: string;
  setNewMessage: (val: string) => void;
  handleUpdate: () => void;
  isProcessing: boolean;
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
  isProcessing,
  colors
}: InteractionConsoleProps) {
  return (
    <Card bg={colors.panel} border="1px solid" borderColor={colors.accent} borderRadius="2xl">
      <CardBody p={6}>
        <VStack align="stretch" spacing={5}>
          {/* Visualiseur de Slot de Storage */}
          <Box bg="black" p={4} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="9px" color="gray.500" mb={2} fontWeight="black" letterSpacing="widest">
              STORAGE SLOT 0
            </Text>
            <Text color="green.300" fontWeight="bold" fontSize="lg" textAlign="center" fontFamily="mono">
              "{currentMessage}"
            </Text>
          </Box>

          {/* Formulaire de Transaction */}
          <FormControl>
            <FormLabel fontSize="10px" color="gray.500" fontWeight="black">
              SIGNER UNE TRANSACTION
            </FormLabel>
            <Input 
              placeholder="Nouveau message..." 
              bg="black" 
              border="none" 
              color="white"
              _focus={{ border: "1px solid", borderColor: colors.accent }}
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
            />
          </FormControl>

          <Button 
            colorScheme="purple" 
            w="full" 
            leftIcon={<FiZap />} 
            isLoading={isProcessing} 
            onClick={handleUpdate}
            fontSize="xs"
            fontWeight="black"
          >
            BROADCAST
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}