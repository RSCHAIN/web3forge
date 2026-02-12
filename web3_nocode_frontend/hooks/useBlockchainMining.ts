import { useState } from "react";
import { ethers } from "ethers";

export function useBlockchainMining() {
  const [isAutomine, setIsAutomine] = useState(true);
  const [isMining, setIsMining] = useState(false);
  const [lastMinedBlock, setLastMinedBlock] = useState<number | null>(null);

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const toggleMiningMode = async () => {
    const newMode = !isAutomine;
    await provider.send("evm_setAutomine", [newMode]);
    setIsAutomine(newMode);
  };

  const manualMine = async () => {
    if (isMining) return;

    setIsMining(true);

    const currentBlock = await provider.getBlockNumber();
    await provider.send("evm_mine", []);
    const newBlock = await provider.getBlockNumber();

    if (newBlock === currentBlock + 1) {
      setLastMinedBlock(newBlock);
    }

    setIsMining(false);
  };

  return {
    isAutomine,
    isMining,
    lastMinedBlock,
    toggleMiningMode,
    manualMine,
  };
}
