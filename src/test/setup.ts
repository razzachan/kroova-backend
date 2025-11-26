/**
 * Vitest Setup File
 * Runs before all tests
 */

import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  console.log('🧪 Starting test suite...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.KROOVA_DEV_LOGIN_BYPASS = '1';
  process.env.KROOVA_DEV_ALLOW_RECYCLE_NO_CPF = '1';
  process.env.KROOVA_DEV_NO_RATELIMIT = '1';
  process.env.KROOVA_DEV_ALLOW_NO_CPF = '1';
});

afterAll(async () => {
  console.log('✅ Test suite completed');
});
