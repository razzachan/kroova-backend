import { randomUUID, createHash } from 'crypto';

/**
 * IPFS Stub Layer
 * Em ambiente atual (sem integração real) geramos CIDs fakes determinísticos
 * para permitir testes de fluxo sem dependência externa (Pinata, web3.storage, etc.).
 *
 * Futuro: substituir por integração real e persistência de pin status.
 */

function generateFakeCid(payload: string) {
  // Simples derivação SHA256 -> base32 recortado com prefixo bafy (estilo CIDv1 aproximado)
  const hash = createHash('sha256').update(payload).digest('hex');
  const base32 = Buffer.from(hash, 'hex').toString('base64') // base64
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .slice(0, 46); // tamanho típico visível
  return 'bafy' + base32;
}

export interface IpfsUploadResult {
  cid: string;
  sizeBytes: number;
  simulated: boolean;
}

export async function ipfsUploadJson(data: any, opts?: { simulateDelayMs?: number }): Promise<IpfsUploadResult> {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  if (opts?.simulateDelayMs) {
    await new Promise(r => setTimeout(r, opts.simulateDelayMs));
  }
  const cid = generateFakeCid(json + randomUUID());
  return { cid, sizeBytes: Buffer.byteLength(json), simulated: true };
}

export async function ipfsUploadBuffer(buf: Buffer, opts?: { simulateDelayMs?: number }): Promise<IpfsUploadResult> {
  if (opts?.simulateDelayMs) {
    await new Promise(r => setTimeout(r, opts.simulateDelayMs));
  }
  const cid = generateFakeCid(buf.toString('hex') + randomUUID());
  return { cid, sizeBytes: buf.length, simulated: true };
}

/** Roadmap Real Integration
 * 1. Adicionar provider configurável (PINATA|WEB3_STORAGE|INTERNAL_GATEWAY)
 * 2. Assinar conteúdo com chave de serviço para auditoria.
 * 3. Guardar mapping CID -> metadata local (tabela ipfs_assets).
 * 4. Re-pin / health-check automático de CIDs críticos.
 */
