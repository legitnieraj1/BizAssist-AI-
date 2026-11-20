import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

// Singleton pattern for the service-role admin client
declare global {
  var _bizassist_supabase: any | undefined;
}

function getSupabaseAdmin(): any {
  if (global._bizassist_supabase) return global._bizassist_supabase;
  global._bizassist_supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return global._bizassist_supabase;
}

export default getSupabaseAdmin;
