import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useMempool() {
  const [pendingTxs, setPendingTxs] = useState<any[]>([]);
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const refresh = async () => {
    const pendingBlock = await provider.send("eth_getBlockByNumber", [
      "pending",
      true,
    ]);
    setPendingTxs(pendingBlock?.transactions || []);
  };

  useEffect(() => {
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    pendingTxs,
    pendingCount: pendingTxs.length,
  };
}
