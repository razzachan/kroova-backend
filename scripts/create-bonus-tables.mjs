import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Criando tabelas faltantes...\n');

  // 1. Adicionar source_type via raw query
  console.log('📝 Adicionando source_type em mystery_box_instances...');
  try {
    // Primeiro verificar se coluna já existe
    const { data: checkCol } = await supabase
      .from('mystery_box_instances')
      .select('instance_id')
      .limit(1);
    
    console.log('✅ Tabela mystery_box_instances acessível');
    
    // Como não temos exec(), vamos tentar via SQL direto no Supabase Dashboard
    console.log('⚠️  Execute manualmente no Supabase SQL Editor:');
    console.log(`
      ALTER TABLE mystery_box_instances
      ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'purchase' CHECK (source_type IN ('purchase', 'booster_bonus'));
    `);
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }

  // 2. Criar mystery_box_bonus_drops
  console.log('\n📝 Para criar mystery_box_bonus_drops, execute no SQL Editor:');
  console.log(`
    CREATE TABLE IF NOT EXISTS mystery_box_bonus_drops (
      drop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      opening_id UUID NOT NULL REFERENCES booster_openings(id),
      instance_id UUID NOT NULL REFERENCES mystery_box_instances(instance_id),
      booster_tier_price DECIMAL(10,2) NOT NULL,
      mystery_box_tier TEXT NOT NULL,
      bonus_chance_used DECIMAL(5,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_mystery_box_bonus_drops_user ON mystery_box_bonus_drops(user_id);
    CREATE INDEX IF NOT EXISTS idx_mystery_box_bonus_drops_opening ON mystery_box_bonus_drops(opening_id);
    CREATE INDEX IF NOT EXISTS idx_mystery_box_bonus_drops_created ON mystery_box_bonus_drops(created_at DESC);
  `);
}

createTables().catch(console.error);
