// Lazy BullMQ import para evitar conexões Redis em ambientes sem necessidade (test, build, scripts rápidos)
let Queue: any, Worker: any, Job: any, Redis: any;
const lazyLoad = () => {
  if (!Queue) {
    ({ Queue, Worker, Job } = require('bullmq'));
    Redis = require('ioredis');
  }
};

/**
 * 🔄 Queue System para Jobs Assíncronos
 * Usa BullMQ + Redis para mint NFT e saques cripto
 */

// Em ambiente de teste, evitamos conectar ao Redis e inicializar Workers para não gerar ruído nem travar integração.
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;
let connection: any = null;
function ensureConnection() {
  if (isTest) return null;
  lazyLoad();
  if (!connection) {
    connection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

/**
 * Fila de Mint NFT
 */
let mintQueue: any = null;
function ensureMintQueue() {
  if (isTest) return null;
  if (!mintQueue) {
    lazyLoad();
    mintQueue = new Queue('mint-nft', { connection: ensureConnection() });
  }
  return mintQueue;
}

/**
 * Fila de Saques Cripto
 */
let withdrawQueue: any = null;
function ensureWithdrawQueue() {
  if (isTest) return null;
  if (!withdrawQueue) {
    lazyLoad();
    withdrawQueue = new Queue('crypto-withdraw', { connection: ensureConnection() });
  }
  return withdrawQueue;
}

/**
 * Worker de Mint NFT
 */
export function startMintWorker() {
  if (isTest) return null;
  lazyLoad();
  return new Worker(
    'mint-nft',
    async (job: any) => {
      const { userId, instanceId } = job.data;
      console.log(`[MINT] Processing mint for user ${userId}, card ${instanceId}`);
      await new Promise(r => setTimeout(r, 500));
      return { success: true, txHash: '0x...', tokenId: instanceId };
    },
    { connection: ensureConnection() }
  );
}

/**
 * Worker de Saque Cripto
 */
export function startWithdrawWorker() {
  if (isTest) return null;
  lazyLoad();
  return new Worker(
    'crypto-withdraw',
    async (job: any) => {
      const { userId, amount } = job.data;
      console.log(`[WITHDRAW] Processing withdrawal for user ${userId}`);
      await new Promise(r => setTimeout(r, 400));
      return { success: true, txHash: '0x...', amount };
    },
    { connection: ensureConnection() }
  );
}

/**
 * Adiciona job de mint à fila
 */
export async function enqueueMint(params: { userId: string; instanceId: string; chain: string; priority?: 'normal' | 'high' }) {
  if (isTest) return; // noop
  const q = ensureMintQueue();
  if (!q) return;
  await q.add('mint-nft', params, {
    priority: params.priority === 'high' ? 1 : 10,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
}

/**
 * Adiciona job de saque à fila
 */
export async function enqueueWithdraw(params: { userId: string; amount: number; walletAddress: string }) {
  if (isTest) return; // noop
  const q = ensureWithdrawQueue();
  if (!q) return;
  await q.add('crypto-withdraw', params, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  });
}
