// Unificado com wrapper de fila em lib/queue.ts
import { queue } from '../../lib/queue.js';
import { nftService } from './nft.service.js';
import { supabaseAdmin } from '../../config/supabase.js';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;

export async function enqueueMint(data: { userId: string; instanceId: string; chain: string; priority?: 'normal' | 'high' }) {
  if (isTest) return; // noop
  await queue.add('mint', {
    userId: data.userId,
    instanceId: data.instanceId,
    chain: data.chain,
    priority: data.priority || 'normal',
  });
}

export function startMintWorker() {
  if (isTest) return null;
  return queue.startMintWorker(async (data: any) => {
    const { instanceId, userId, chain } = data;
    const { data: instance } = await supabaseAdmin
      .from('cards_instances')
      .select('*, cards_base(*)')
      .eq('id', instanceId)
      .single();
    if (!instance) throw new Error('Instância não encontrada');
    const base = (instance as any).cards_base;
    const skin = (instance as any).skin || 'default';
    nftService.buildMetadata({ base, instance, skin }); // meta build (placeholder - poderia persistir)
    const simulatedTxHash = '0xtx_' + instanceId.slice(0, 8);
    const simulatedTokenUri = 'ipfs://placeholder-' + instanceId.slice(0, 8);
    await nftService.finalizeMint(instanceId, simulatedTxHash, simulatedTokenUri);
    return { chain, txHash: simulatedTxHash, tokenUri: simulatedTokenUri, instanceId, userId };
  });
}