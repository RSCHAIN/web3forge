"use client";

import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
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

export default function DeployFromABIForm({ userAddress, onDeployed }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    abi: "",
    bytecode: "",
    constructorArgs: "",
    network: "anvil",
    contractType: "custom",
  });

  async function deploy() {
    try {
      if (!form.abi || !form.bytecode) {
        toast({
          title: "Missing fields",
          description: "ABI and bytecode are required",
          status: "warning",
        });
        return;
      }

      setLoading(true);

      /* 1️⃣ Parse ABI & args */
      let abiParsed: any;
      let argsParsed: any[] = [];

      try {
        abiParsed = JSON.parse(form.abi);
      } catch {
        throw new Error("Invalid ABI JSON");
      }

      if (form.constructorArgs.trim()) {
        try {
          argsParsed = JSON.parse(form.constructorArgs);
          if (!Array.isArray(argsParsed)) {
            throw new Error();
          }
        } catch {
          throw new Error("Constructor args must be a JSON array");
        }
      }

      /* 2️⃣ Déploiement blockchain */
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(
        abiParsed,
        form.bytecode,
        signer
      );

      const contract = await factory.deploy(...argsParsed);
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
          abi: abiParsed,
          contract_type: form.contractType,
        }),
      });

      toast({
        title: "Contract deployed",
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
          <FormLabel>ABI (JSON)</FormLabel>
          <Textarea
            placeholder='[ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" } ]'
            minH="120px"
            onChange={(e) => setForm({ ...form, abi: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Bytecode</FormLabel>
          <Textarea
            placeholder="0x608060405234..."
            minH="80px"
            onChange={(e) => setForm({ ...form, bytecode: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Constructor arguments (JSON array)</FormLabel>
          <Input
            placeholder='["MyToken", "MTK", 1000000]'
            onChange={(e) =>
              setForm({ ...form, constructorArgs: e.target.value })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Contract type</FormLabel>
          <Select
            value={form.contractType}
            onChange={(e) =>
              setForm({ ...form, contractType: e.target.value })
            }
          >
            <option value="custom">Custom</option>
            <option value="erc20">ERC20</option>
            <option value="erc721">ERC721</option>
            <option value="erc1155">ERC1155</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Network</FormLabel>
          <Select
            value={form.network}
            onChange={(e) =>
              setForm({ ...form, network: e.target.value })
            }
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
          Deploy from ABI
        </Button>
      </VStack>
    </Box>
  );
}
