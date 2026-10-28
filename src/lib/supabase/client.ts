"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  return client;
}
