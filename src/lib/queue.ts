let BullQueue: any, BullWorker: any, Redis: any;
async function lazyLoad() {
  if (!BullQueue) {
    const bullmq = await import('bullmq');
    BullQueue = bullmq.Queue;
    BullWorker = bullmq.Worker;
    const ioredis = await import('ioredis');
    Redis = ioredis.default;
  }
}

interface InternalJobData {
  [k: string]: any;
}

export type QueueJobType = 'mint' | 'withdraw_crypto';
export type QueueJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;
const redisDisabled = String(process.env.REDIS_DISABLED || '').toLowerCase() === 'true';

class InMemoryQueue {
  private store: { id: string; type: QueueJobType; data: InternalJobData; status: QueueJobStatus }[] = [];
  async add(type: QueueJobType, data: InternalJobData) {
    const id = 'mem-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    this.store.push({ id, type, data, status: 'pending' });
    return id;
  }
  async getStatus(id: string) {
    const f = this.store.find(j => j.id === id);
    return f ? f.status : 'failed';
  }
}

class BullQueueWrapper {
  private q: any;
  private initialized = false;
  
  constructor(private name: string) {}
  
  private async init() {
    if (this.initialized) return;
    await lazyLoad();
    this.q = new BullQueue(this.name, { connection: this.conn() });
    this.initialized = true;
  }
  
  private _conn: any;
  private conn() {
    if (this._conn) return this._conn;
    this._conn = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    }).on('error', () => {});
    return this._conn;
  }
  async add(type: QueueJobType, data: InternalJobData) {
    await this.init();
    const job = await this.q.add(type, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
    return job.id as string;
  }
  async getStatus(id: string) {
    await this.init();
    const job = await this.q.getJob(id);
    if (!job) return 'failed';
    if (await job.isCompleted()) return 'completed';
    if (await job.isFailed()) return 'failed';
    if (await job.isActive()) return 'processing';
    return 'pending';
  }
  async startMintWorker(processor: (data: any) => Promise<any>) {
    await lazyLoad();
    return new BullWorker(this.q.name, async (job: any) => processor(job.data), { connection: this.conn() });
  }
}

export class Queue {
  private impl: InMemoryQueue | BullQueueWrapper;
  constructor() {
    this.impl = (isTest || redisDisabled) ? new InMemoryQueue() : new BullQueueWrapper('kroova-main');
  }
  async add(type: QueueJobType, data: InternalJobData) {
    return this.impl.add(type, data);
  }
  async getStatus(id: string) {
    return this.impl.getStatus(id);
  }
  startMintWorker(processor: (data: any) => Promise<any>) {
    if (this.impl instanceof BullQueueWrapper) return this.impl.startMintWorker(processor);
    return null;
  }
}

export const queue = new Queue();
