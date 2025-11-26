import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Script para gerar access token Supabase do usuário akroma.julio@gmail.com
// Fluxo:
// 1. Usa service key para localizar usuário.
// 2. Define uma senha temporária aleatória segura.
// 3. Faz signIn com a senha temporária usando anon key.
// 4. Imprime ACCESS_TOKEN, REFRESH_TOKEN e a senha temporária.
// 5. Recomendar trocar a senha após login.

async function main() {
  const email = 'akroma.julio@gmail.com';
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anon) {
    console.error('Faltam variáveis: SUPABASE_URL / SUPABASE_SERVICE_KEY / SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // listUsers não tem filtro direto por email então paginamos até achar
  let user: any | undefined;
  let page = 1;
  const perPage = 50;
  while (!user) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('Erro listUsers:', error); process.exit(1);
    }
    user = data.users.find(u => u.email === email);
    if (!user && data.users.length < perPage) break; // acabou
    page++;
  }

  if (!user) {
    console.error(`Usuário ${email} não encontrado. Faça login ao menos uma vez no frontend.`);
    process.exit(1);
  }

  // Gerar senha temporária forte
  const tempPassword = 'Akroma!' + Math.random().toString(36).slice(2, 10) + '!' + Date.now().toString().slice(-4);

  const { data: updated, error: updErr } = await admin.auth.admin.updateUserById(user.id, { password: tempPassword });
  if (updErr) {
    console.error('Erro ao atualizar senha:', updErr); process.exit(1);
  }

  const publicClient = createClient(url, anon, { auth: { autoRefreshToken: true, persistSession: false } });
  const { data: signInData, error: signErr } = await publicClient.auth.signInWithPassword({ email, password: tempPassword });
  if (signErr) {
    console.error('Erro signIn:', signErr); process.exit(1);
  }

  const accessToken = signInData.session?.access_token;
  const refreshToken = signInData.session?.refresh_token;

  if (!accessToken) {
    console.error('Sem access token retornado.');
    process.exit(1);
  }

  console.log('=== TOKEN GERADO COM SUCESSO ===');
  console.log('ACCESS_TOKEN=' + accessToken);
  console.log('REFRESH_TOKEN=' + refreshToken);
  console.log('TEMP_PASSWORD=' + tempPassword);
  console.log('\nUse o ACCESS_TOKEN em chamadas Bearer. Faça login com a senha temporária e altere-a depois.');
}

main().catch(e => { console.error('Falha inesperada:', e); process.exit(1); });
