"use client";

import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Select,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { API_BASE } from "../../lib/api";

interface Props {
  userAddress: string;
  onDeployed?: () => void;
}

export default function DeployERC1155Form({ userAddress, onDeployed }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    uri: "",
    network: "anvil",
  });

  async function deploy() {
    if (!form.uri) {
      toast({
        title: "Missing data",
        description: "URI is required",
        status: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      /* 1️⃣ Compilation backend */
      const res = await fetch(`${API_BASE}/deploy/prepare_erc1155`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Compilation failed");
      }

      const { abi, bytecode } = await res.json();

      /* 2️⃣ Déploiement blockchain */
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      const contract = await factory.deploy(form.uri);
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash;

      /* 3️⃣ Enregistrement backend */
      await fetch(`${API_BASE}/deploy/record_erc20`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_address: address,
          tx_hash: txHash,
          chain: form.network,
          user_id: userAddress.toLowerCase(),
          abi,
          contract_type: "erc1155",
        }),
      });

      toast({
        title: "ERC1155 deployed",
        description: address,
        status: "success",
      });

      onDeployed?.();
    } catch (e: any) {
      toast({
        title: "Deployment failed",
        description: e.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Metadata URI</FormLabel>
          <Input
            placeholder="https://example.com/{id}.json"
            onChange={(e) => setForm({ ...form, uri: e.target.value })}
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
            <option value="bsc">BSC</option>
            <option value="avalanche">Avalanche</option>
          </Select>
        </FormControl>

        <Button
          colorScheme="purple"
          w="full"
          onClick={deploy}
          isLoading={loading}
        >
          Deploy ERC1155
        </Button>
      </VStack>
    </Box>
  );
}
