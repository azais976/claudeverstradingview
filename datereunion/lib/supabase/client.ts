import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Supabase browser client (for use in Client Components).
 * Uses SSR package for proper cookie handling.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
