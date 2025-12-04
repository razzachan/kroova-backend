import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    version: 'v2-with-debug-logs',
    timestamp: new Date().toISOString(),
    message: '🆕 VERSÃO NOVA COM DEBUG LOGS'
  });
}
