"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Progress,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { ethers } from "ethers";
import { API_BASE } from "../../lib/api";

interface Props {
  userAddress: string;
  onDeployed?: () => void;
}

export default function DeployERC721Form({ userAddress, onDeployed }: Props) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    baseURI: "",
    network: "anvil",
  });

  async function deploy() {
    if (!form.name || !form.symbol) {
      toast({
        title: "Missing fields",
        description: "Name and Symbol are required",
        status: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      setStep(1);

      /* 1️⃣ Compile backend */
      setStep(2);
      const compileRes = await fetch(`${API_BASE}/deploy/prepare_erc721`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!compileRes.ok) {
        const err = await compileRes.text();
        throw new Error(err || "ERC721 compilation failed");
      }

      const { abi, bytecode } = await compileRes.json();

      /* 2️⃣ Deploy on-chain */
      setStep(3);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      // 🔥 ERC721 OpenZeppelin constructor(name, symbol)
      const contract = await factory.deploy(form.name, form.symbol);
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash;

      /* 3️⃣ Record backend */
      setStep(4);
      await fetch(`${API_BASE}/deploy/record_erc721`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_address: address,
          tx_hash: txHash,
          chain: form.network,
          user_id: userAddress,
          abi,
          contract_type: "erc721",
          metadata_base_uri: form.baseURI || null,
        }),
      });

      toast({
        title: "ERC721 deployed",
        description: address,
        status: "success",
      });

      onDeployed?.();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Deployment failed",
        description: e.message,
        status: "error",
      });
    } finally {
      setLoading(false);
      setStep(0);
    }
  }

  return (
    <Box bg="gray.800" p={6} borderRadius="2xl">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Collection Name</FormLabel>
          <Input
            placeholder="My NFT Collection"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Symbol</FormLabel>
          <Input
            placeholder="MNFT"
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Base Metadata URI (optional)</FormLabel>
          <Input
            placeholder="ipfs://Qm..."
            onChange={(e) => setForm({ ...form, baseURI: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Network</FormLabel>
          <Select
            value={form.network}
            onChange={(e) => setForm({ ...form, network: e.target.value })}
          >
            <option value="anvil">Local (Anvil)</option>
            <option value="sepolia">Sepolia</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </Select>
        </FormControl>

        {loading && (
          <>
            <Progress value={(step / 4) * 100} w="full" />
            <Spinner />
            <Text fontSize="sm" color="gray.400">
              Step {step} / 4
            </Text>
          </>
        )}

        <Button
          colorScheme="purple"
          w="full"
          isDisabled={loading}
          onClick={deploy}
        >
          Deploy ERC721
        </Button>
      </VStack>
    </Box>
  );
}
