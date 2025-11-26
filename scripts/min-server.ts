import fastify from 'fastify';

const app = fastify({ logger: true });

app.get('/health', async () => ({ ok: true, diag: true }));

function heartbeat(tag: string) {
  const handles = (process as any)._getActiveHandles?.() || [];
  const reqs = (process as any)._getActiveRequests?.() || [];
  console.log(`[min] ${tag} handles=${handles.length} requests=${reqs.length}`);
}

process.on('beforeExit', (code) => {
  console.log('[min] beforeExit code', code);
});
process.on('exit', (code) => {
  console.log('[min] exit code', code);
});
process.on('uncaughtException', (err) => {
  console.log('[min] uncaughtException', err);
});
process.on('unhandledRejection', (reason) => {
  console.log('[min] unhandledRejection', reason);
});

async function start() {
  await app.listen({ port: 3456, host: '0.0.0.0' });
  console.log('[min] listening on 3456');
  heartbeat('post-listen');
  setInterval(() => heartbeat('interval'), 5000);
}

start().catch((e) => {
  console.error('[min] start error', e);
});
