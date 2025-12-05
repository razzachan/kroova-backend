-- ============================================================================
-- FIX CORS - Add Production URLs to Auth Configuration
-- ============================================================================
-- 
-- PROBLEMA: Login bloqueado por CORS policy
-- CAUSA: Domínios de produção Vercel não estão nas allowed origins
-- 
-- Esta migration atualiza a configuração de auth.config para incluir
-- os domínios de produção do Vercel como origens permitidas.
-- ============================================================================

-- NOTA: Esta configuração é feita via Dashboard na tabela auth.config
-- CLI não expõe comandos diretos para auth.config, mas podemos criar
-- um helper SQL para documentar os valores corretos

-- ============================================================================
-- VALORES QUE DEVEM SER CONFIGURADOS NO DASHBOARD:
-- ============================================================================
-- 
-- Supabase Dashboard → Authentication → URL Configuration
-- 
-- Site URL (primary):
--   https://frontend-razzachans-projects.vercel.app
-- 
-- Additional Redirect URLs (add all):
--   https://frontend-razzachans-projects.vercel.app/**
--   https://frontend-cyan-nine-hl1m0yayym.vercel.app/**
--   https://frontend-razzachan-razzachans-projects.vercel.app/**
--   http://localhost:3000/**
--
-- Se seu plano suportar wildcards:
--   https://*.vercel.app
--   https://frontend-*-razzachans-projects.vercel.app
-- ============================================================================

-- Verificar configuração atual de auth (requer permissões de service_role)
DO $$ 
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'CORS FIX - Auth Configuration Required';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Esta migration é informativa. A configuração de CORS';
  RAISE NOTICE 'deve ser feita manualmente via Supabase Dashboard:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Vá para: Dashboard → Authentication → URL Configuration';
  RAISE NOTICE '';
  RAISE NOTICE '2. Site URL:';
  RAISE NOTICE '   https://frontend-razzachans-projects.vercel.app';
  RAISE NOTICE '';
  RAISE NOTICE '3. Additional Redirect URLs (adicione todas):';
  RAISE NOTICE '   https://frontend-razzachans-projects.vercel.app/**';
  RAISE NOTICE '   https://frontend-cyan-nine-hl1m0yayym.vercel.app/**';
  RAISE NOTICE '   https://frontend-razzachan-razzachans-projects.vercel.app/**';
  RAISE NOTICE '   http://localhost:3000/**';
  RAISE NOTICE '';
  RAISE NOTICE '4. Wildcards (se disponível no seu plano):';
  RAISE NOTICE '   https://*.vercel.app';
  RAISE NOTICE '';
  RAISE NOTICE '5. Salve e aguarde 30-60 segundos para propagação';
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
END $$;

-- Esta migration não faz alterações estruturais, apenas documenta
-- a configuração necessária que deve ser feita via Dashboard
