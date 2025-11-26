import { supabaseAdmin } from '../src/config/supabase.js';

// Upsert a user in Supabase Auth and ensure a row exists in public.users
// Usage: npx tsx scripts/dev-upsert-user.ts <email> <password>
async function run() {
  const email = process.argv[2];
  const password = process.argv[3] || 'Senha12';
  if (!email) {
    console.error('Usage: npx tsx scripts/dev-upsert-user.ts <email> <password>');
    process.exit(1);
  }

  // Try create user in Auth first
  let authId: string | null = null;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    } as any);
    if (error) throw error;
    authId = data.user?.id || null;
    console.log('Auth user created', { id: authId, email });
  } catch (err: any) {
    // If already exists, find by listing and update password
    console.warn('CreateUser failed, will attempt lookup and password update:', err?.message || err);
    // Try get via listUsers
    let page = 1;
    let found = null as null | { id: string; email?: string };
    while (page <= 10 && !found) {
      const { data, error } = await (supabaseAdmin as any).auth.admin.listUsers({ page, perPage: 100 });
      if (error) break;
      const match = (data?.users || []).find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
      if (match) found = { id: match.id, email: match.email };
      page += 1;
    }
    if (!found) {
      console.error('Could not locate existing auth user for email', email);
      process.exit(1);
    }
    authId = found.id;
    const { error: updErr } = await (supabaseAdmin as any).auth.admin.updateUserById(authId, { password } as any);
    if (updErr) {
      console.error('Failed to update password for auth user', updErr.message || updErr);
      process.exit(1);
    }
    console.log('Auth user password updated', { id: authId, email });
  }

  if (!authId) {
    console.error('No auth user id determined');
    process.exit(1);
  }

  // Ensure row exists in public.users with the same id
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!existingUser) {
    const displayId = 'usr_' + Math.random().toString(36).slice(2, 8);
    const { error: insErr } = await supabaseAdmin.from('users').insert({
      id: authId,
      display_id: displayId,
      email,
      name: null,
      cpf: null,
      cpf_verified: false,
    });
    if (insErr) {
      console.error('Failed to insert into users table:', insErr.message);
      process.exit(1);
    }
    console.log('Inserted users row', { id: authId, email });
  } else {
    console.log('Users row already exists for email', email);
  }

  console.log('Done', { id: authId, email });
}

run().catch((e) => {
  console.error('Unhandled dev-upsert-user error', e);
  process.exit(1);
});
