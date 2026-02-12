// /lib/web3utils.ts

export const SUPPORTED_TEST_NETWORKS: Record<string, string> = {
  "31337": "anvil",      // Local Development
  "11155111": "sepolia", // Ethereum Testnet
  "421614": "arbitrum_sepolia", // Layer 2 Testnet (Optionnel)
  "80002": "amoy",       // Polygon Testnet (Optionnel)
};

/**
 * Retourne le label du réseau de test ou "unsupported"
 */
export const getNetworkLabel = (chainId: bigint | number | string): string => {
  const id = chainId.toString();
  return SUPPORTED_TEST_NETWORKS[id] || "unsupported";
};

/**
 * Vérifie si le réseau est un réseau de test autorisé
 */
export const isTestNetwork = (chainId: bigint | number): boolean => {
  return chainId.toString() in SUPPORTED_TEST_NETWORKS;
};