import { supabase, supabaseAdmin } from '../../config/supabase.js';

interface BuildMetadataInput {
  base: any;
  instance: any;
  skin: string;
}

export class NftService {
  /**
   * Constrói metadata conforme `KROOVA_NFT_PROTOCOL.md`
   */
  buildMetadata(input: BuildMetadataInput) {
    const { base, instance, skin } = input;
    const displayId = base.display_id;
    const editionId = base.edition_id;
    const metadata = base.metadata || {};
    const rarityValue = metadata.rarity_value;
    return {
      name: `${displayId} - ${skin}`,
      description: base.description || 'Carta Kroova',
      external_url: `https://kroova.com/card/${displayId}`,
      image: metadata.image_url || 'ipfs://pending',
      attributes: [
        { trait_type: 'Edição', value: editionId },
        { trait_type: 'Raridade', value: base.rarity },
        { trait_type: 'RaridadeValor', value: rarityValue },
        { trait_type: 'Arquetipo', value: base.archetype },
        { trait_type: 'Skin', value: skin },
        { trait_type: 'LiquidezBaseBRL', value: base.base_liquidity_brl },
        { trait_type: 'HashLocal', value: metadata.hash },
      ],
      kroova: {
        instance_id: instance.id,
        base_id: base.id,
        display_id: displayId,
        edition_id: editionId,
        skin,
        hash: metadata.hash,
      },
    };
  }

  /**
   * Marca instância como mint pendente (idempotente)
   */
  async markPending(instanceId: string) {
    await supabaseAdmin.from('cards_instances').update({ mint_pending: true }).eq('id', instanceId);
  }

  /**
   * Conclui mint salvando hash_onchain + minted_at
   */
  async finalizeMint(instanceId: string, txHash: string, tokenUri: string) {
    await supabaseAdmin
      .from('cards_instances')
      .update({ hash_onchain: txHash, minted_at: new Date().toISOString(), token_uri: tokenUri, mint_pending: false })
      .eq('id', instanceId);
  }
}

export const nftService = new NftService();