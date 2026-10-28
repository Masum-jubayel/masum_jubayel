import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured, publicEnv, serverEnv } from "@/lib/env";

/** Supabase client bound to the visitor's session (RLS applies as that user). Returns null when not configured. */
export async function getServerSupabase() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Anonymous, cookie-free client for public reads (safe inside cached/static rendering). */
export function getPublicSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createPlainClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, { auth: { persistSession: false } });
}

/** Service-role client. Bypasses RLS — server-only, use sparingly (contact form inserts). */
export function getAdminSupabase() {
  const { serviceRoleKey } = serverEnv();
  if (!isSupabaseConfigured() || !serviceRoleKey) return null;
  return createPlainClient(publicEnv.supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export async function getSessionUser() {
  const sb = await getServerSupabase();
  if (!sb) return { sb: null, user: null } as const;
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user } as const;
}

/** Admin = row in public.profiles with is_admin = true (enforced again by RLS in the database). */
export async function getAdmin() {
  const { sb, user } = await getSessionUser();
  if (!sb || !user) return null;
  const { data } = await sb.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return data?.is_admin ? { sb, user } : null;
}
