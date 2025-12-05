import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://mmcytphoeyxeylvaqjgr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migration: Mystery Box Booster Bonus System...\n');

  // 1. ADD COLUMN mystery_box_bonus_chance
  console.log('📝 Adicionando coluna mystery_box_bonus_chance...');
  const { error: alterError } = await supabase.rpc('exec', {
    sql: `
      ALTER TABLE booster_types 
      ADD COLUMN IF NOT EXISTS mystery_box_bonus_chance DECIMAL(5,2) DEFAULT 0.0;
    `
  });
  if (alterError) console.log('⚠️  Coluna já existe ou erro:', alterError.message);

  // 2. UPDATE booster_types com probabilidades
  console.log('📝 Configurando probabilidades por tier...');
  
  const updates = [
    { price: 0.50, chance: 2.0 },
    { price: 1.00, chance: 3.0 },
    { price: 2.00, chance: 4.0 },
    { price: 5.00, chance: 5.0 },
    { price: 10.00, chance: 6.0 }
  ];

  for (const { price, chance } of updates) {
    const { error } = await supabase
      .from('booster_types')
      .update({ mystery_box_bonus_chance: chance })
      .eq('price_brl', price);
    
    if (error) {
      console.error(`❌ Erro ao atualizar tier R$ ${price}:`, error);
    } else {
      console.log(`✅ Tier R$ ${price} → ${chance}% chance`);
    }
  }

  // 3. ADD COLUMN source_type em mystery_box_instances
  console.log('📝 Adicionando coluna source_type...');
  const { error: sourceError } = await supabase.rpc('exec', {
    sql: `
      ALTER TABLE mystery_box_instances
      ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'purchase' CHECK (source_type IN ('purchase', 'booster_bonus'));
    `
  });
  if (sourceError) console.log('⚠️  Coluna já existe ou erro:', sourceError.message);

  // 4. CREATE TABLE mystery_box_bonus_drops
  console.log('📝 Criando tabela mystery_box_bonus_drops...');
  const { error: createError } = await supabase.rpc('exec', {
    sql: `
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
    `
  });
  if (createError) console.log('⚠️  Tabela já existe ou erro:', createError.message);

  // 5. Verificar resultado
  console.log('\n📊 Verificando configuração final...\n');
  const { data, error } = await supabase
    .from('booster_types')
    .select('name, price_brl, mystery_box_bonus_chance')
    .order('price_brl');

  if (error) {
    console.error('❌ Erro ao verificar:', error);
  } else {
    console.table(data);
    console.log('\n✅ Migration aplicada com sucesso!');
  }
}

applyMigration().catch(console.error);
