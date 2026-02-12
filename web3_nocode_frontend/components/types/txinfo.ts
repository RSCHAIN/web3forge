import { ethers } from "ethers";

/**
 * Représente les données structurées d'une transaction 
 */


export interface TxInfo {
  hash: string;
  type: "deploy" | "write" | "empty";
  blockNumber: number;
  gasUsed: bigint;
  gasPrice: bigint;
  nonce: number;
  from: string;
  value: bigint;
  to?: string;
  timestamp?: number;
  status?: "success" | "failed" | "pending";
  isPlaceholder?: boolean;
}


/**
 * Interface pour les métadonnées de déploiement (Data from MongoDB)
 */
export interface DeploymentInfo {
  contract_address: string;
  contract_type: string; 
  tx_hash: string;
  chain: string;
  abi?: ethers.Interface | ethers.InterfaceAbi | any;
  blockNumber: number; // 👈 OBLIGATOIRE : pour que le BlockchainVisualizer fonctionne
  
  // Champs optionnels ou legacy
  address?: string; 
}