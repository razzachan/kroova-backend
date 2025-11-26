import { supabase } from '../src/config/supabase.js';

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: npx tsx scripts/dev-login-test.ts <email> <password>');
    process.exit(1);
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Sign in failed:', error.message);
    process.exit(2);
  }
  console.log('Sign in OK:', { user: data.user?.id, email: data.user?.email });
}

run().catch((e) => { console.error(e); process.exit(1); });
