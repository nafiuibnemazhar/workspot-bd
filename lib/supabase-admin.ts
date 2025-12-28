import { createClient } from "@supabase/supabase-js";

// This client has GOD MODE (Bypass RLS). Use only on the server!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
