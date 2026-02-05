"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
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

export default function DeployERC20Form({ userAddress, onDeployed }: Props) {
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    supply: "",
    decimals: 18,
    network: "anvil",
  });

  async function deploy() {
    try {
      setLoading(true);
      setStep(1);

      // 1️⃣ Compile
      setStep(2);
      const res = await fetch(`${API_BASE}/deploy/prepare_erc20`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Compilation failed");
      const { abi, bytecode } = await res.json();

      // 2️⃣ Deploy
      setStep(3);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      const contract = await factory.deploy(
        form.name,
        form.symbol,
        ethers.parseUnits(form.supply, form.decimals),
        form.decimals
      );
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash;

      // 3️⃣ Record
      setStep(4);
      await fetch(`${API_BASE}/deploy/record_erc20`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_address: address,
          tx_hash: txHash,
          chain: form.network,
          user_id: userAddress,
          abi,
          contract_type: "erc20",
        }),
      });

      toast({
        title: "ERC20 deployed",
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
      setStep(0);
    }
  }

  return (
    <Box bg="gray.800" p={6} borderRadius="2xl">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormControl>

        <FormControl>
          <FormLabel>Symbol</FormLabel>
          <Input onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
        </FormControl>

        <FormControl>
          <FormLabel>Supply</FormLabel>
          <Input onChange={(e) => setForm({ ...form, supply: e.target.value })} />
        </FormControl>

        <FormControl>
          <FormLabel>Decimals</FormLabel>
          <NumberInput
            min={0}
            max={18}
            defaultValue={18}
            onChange={(_, v) => setForm({ ...form, decimals: v })}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Network</FormLabel>
          <Select
            value={form.network}
            onChange={(e) => setForm({ ...form, network: e.target.value })}
          >
            <option value="anvil">Anvil</option>
            <option value="sepolia">Sepolia</option>
            <option value="ethereum">Ethereum</option>
          </Select>
        </FormControl>

        {loading && (
          <>
            <Progress value={(step / 4) * 100} w="full" />
            <Spinner />
            <Text fontSize="sm">Step {step} / 4</Text>
          </>
        )}

        <Button
          colorScheme="purple"
          w="full"
          isDisabled={loading}
          onClick={deploy}
        >
          Deploy ERC20
        </Button>
      </VStack>
    </Box>
  );
}
