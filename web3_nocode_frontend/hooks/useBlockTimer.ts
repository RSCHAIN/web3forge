import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useBlockTimer() {
  const [latestBlock, setLatestBlock] = useState<number | null>(null);
  const [secondsSinceLastBlock, setSecondsSinceLastBlock] = useState(0);

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  useEffect(() => {
    provider.on("block", (blockNumber) => {
      setLatestBlock(blockNumber);
      setSecondsSinceLastBlock(0);
    });

    return () => {
      provider.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceLastBlock((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { latestBlock, secondsSinceLastBlock };
}
