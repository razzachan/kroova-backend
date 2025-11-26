import { ethers } from "ethers";
import { env } from "../config/env.js";
import fs from 'fs';
import path from 'path';

/**
 * 🪙 Polygon Web3 Client
 * Gerencia mint de NFTs ERC-1155
 */

// Provider Polygon
export const provider = new ethers.JsonRpcProvider(env.polygonRpcUrl);

// Wallet do sistema (para assinar transações)
export const systemWallet = new ethers.Wallet(env.walletPrivateKey, provider);

let contractInstance: ethers.Contract | null = null;
function loadAbi() {
  const abiPath = path.resolve('c:/Kroova/src/lib/abi/kroova1155.abi.json');
  if (!fs.existsSync(abiPath)) return [];
  try { return JSON.parse(fs.readFileSync(abiPath, 'utf8')); } catch { return []; }
}

export function ensureContract() {
  if (contractInstance) return contractInstance;
  if (!env.nftContractAddress) return null;
  const abi = loadAbi();
  if (!abi.length) return null;
  contractInstance = new ethers.Contract(env.nftContractAddress, abi, systemWallet);
  return contractInstance;
}

/**
 * Mint NFT ERC-1155
 * TODO: Deploy do contrato e adicionar ABI + endereço
 */
export async function mintNft(params: { to: string; tokenId: string; metadata: string }) {
  const contract = ensureContract();
  if (!contract) {
    // Fallback log only
    console.log('Mint fallback (no contract configured)', params);
    return { success: true, txHash: '0x-simulated-' + params.tokenId.slice(0,8), tokenId: params.tokenId };
  }
  const tx = await contract.mint(params.to, BigInt(params.tokenId), 1n, params.metadata);
  const receipt = await tx.wait();
  return { success: true, txHash: receipt?.hash || tx.hash, tokenId: params.tokenId };
}

/**
 * Gera metadata JSON para NFT (KROOVA_NFT_PROTOCOL.md)
 */
export function generateNftMetadata(card: {
  name: string;
  description: string;
  image_url: string;
  rarity: string;
  archetype: string;
  edition_id: string;
  mode_visual: string;
  base_liquidity_brl: number;
  metadata: Record<string, unknown>;
}) {
  return {
    name: card.name,
    description: card.description,
    image: card.image_url || "ipfs://...",
    external_url: `https://kroova.com/card/${card.edition_id}`,
    attributes: [
      { trait_type: "Raridade", value: card.rarity },
      { trait_type: "Arquetipo", value: card.archetype },
      { trait_type: "Tendência", value: card.metadata.trend || 0 },
      { trait_type: "Influência Social", value: card.metadata.influence || 0 },
      {
        trait_type: "Impacto Econômico",
        value: card.metadata.rarity_value || 0,
      },
      { trait_type: "Skin", value: card.mode_visual },
      {
        trait_type: "Valor Base (Liquidez)",
        value: `R$ ${card.base_liquidity_brl.toFixed(2)}`,
      },
      { trait_type: "Edição", value: card.edition_id },
    ],
  };
}
