import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3333,
  nodeEnv: process.env.NODE_ENV || "development",
  bindHost: process.env.BIND_HOST || "0.0.0.0",

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || (process.env.NODE_ENV === 'test' ? 'encryption-test-key-32-bytes-----' : undefined)!,

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || (process.env.NODE_ENV === 'test' ? 'http://localhost:54321' : undefined)!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || (process.env.NODE_ENV === 'test' ? 'anon-test-key' : undefined)!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || (process.env.NODE_ENV === 'test' ? 'service-test-key' : undefined)!,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_KEY || (process.env.NODE_ENV === 'test' ? 'jwt-secret-test' : undefined)!,

  // JWT
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'jwt-test-secret' : undefined)!,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || (process.env.NODE_ENV !== 'production' ? 'sk_test_dummy' : undefined)!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || (process.env.NODE_ENV !== 'production' ? 'whsec_dummy' : undefined)!,

  // Blockchain
  polygonRpcUrl: process.env.POLYGON_RPC_URL || (process.env.NODE_ENV !== 'production' ? 'http://localhost:8545' : undefined)!,
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY || (process.env.NODE_ENV !== 'production' ? '0x'.padEnd(66,'0') : undefined)!,

  // App
  appUrl: process.env.APP_URL || "http://localhost:3333",

  // Payments & Wallet policy
  minWithdrawPixBrl: Number(process.env.MIN_WITHDRAW_PIX_BRL || 5),
  smallDepositThresholdBrl: Number(process.env.SMALL_DEPOSIT_THRESHOLD_BRL || 5),
  smallDepositFixedFeeBrl: Number(process.env.SMALL_DEPOSIT_FIXED_FEE_BRL || 0.39),

  // Observability
  distributionSnapshotIntervalMinutes: Number(process.env.DIST_SNAPSHOT_INTERVAL_MINUTES || 15),
  thresholdChangeMinSeconds: Number(process.env.THRESHOLD_CHANGE_MIN_SECONDS || 60),
  auditDashboardCacheSeconds: Number(process.env.AUDIT_DASHBOARD_CACHE_SECONDS || 5),
  auditHistoryHmacSecret: process.env.AUDIT_HISTORY_HMAC_SECRET || '',
  auditExportHmacSecret: process.env.AUDIT_EXPORT_HMAC_SECRET || '',
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || '',
  alertWebhookTimeoutMs: Number(process.env.ALERT_WEBHOOK_TIMEOUT_MS || 2000),
  auditDashboardLatencyAlertMs: Number(process.env.AUDIT_DASHBOARD_LATENCY_ALERT_MS || 250),
  auditAnchorEnabled: (process.env.AUDIT_ANCHOR_ENABLED === 'true'),
  auditAnchorUrl: process.env.AUDIT_ANCHOR_URL || '',
  economicSeriesIntervalSeconds: Number(process.env.ECONOMIC_SERIES_INTERVAL_SECONDS || 60),
  economicSeriesMaxEntries: Number(process.env.ECONOMIC_SERIES_MAX_ENTRIES || 500),
  economicSeriesEventMinSeconds: Number(process.env.ECONOMIC_SERIES_EVENT_MIN_SECONDS || 15),
  economicSeriesPersistEnabled: process.env.ECONOMIC_SERIES_PERSIST_ENABLED === 'true',
  economicSeriesIntegrityEnabled: process.env.ECONOMIC_SERIES_INTEGRITY_ENABLED === 'true',
  economicSeriesHmacSecret: process.env.ECONOMIC_SERIES_HMAC_SECRET || '',
  economicSeriesExportEnabled: process.env.ECONOMIC_SERIES_EXPORT_ENABLED === 'true',
  economicSeriesExportAnchorEnabled: process.env.ECONOMIC_SERIES_EXPORT_ANCHOR_ENABLED === 'true',
  economicSeriesRtpAlertHighPct: Number(process.env.ECONOMIC_SERIES_RTP_ALERT_HIGH_PCT || 150),
  economicSeriesRtpAlertLowPct: Number(process.env.ECONOMIC_SERIES_RTP_ALERT_LOW_PCT || 30),

  // Redis
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: process.env.REDIS_PORT || "6379",

  // Internal guard (staging/production)
  internalGuardEnabled: process.env.INTERNAL_GUARD_ENABLED === 'true',
  internalToken: process.env.INTERNAL_TOKEN || '',

  // FX placeholder (e.g. FX_MATIC_BRL) handled dynamically; provide optional overrides
  fxMaticBrl: process.env.FX_MATIC_BRL || '',

  // NFT Contract
  nftContractAddress: process.env.NFT_CONTRACT_ADDRESS || '',
  nftMintChain: process.env.NFT_MINT_CHAIN || 'polygon',
};
