/** Centralized env access. Public values may be exposed to the browser; secrets must only be read on the server. */
export const publicEnv = {
  // Accepts the URL with or without a trailing slash or "/rest/v1" — only the project origin is used.
  supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/(rest|auth)\/v1\/?$/i, "").replace(/\/+$/, ""),
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export const isSupabaseConfigured = () => Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

export function serverEnv() {
  if (typeof window !== "undefined") throw new Error("serverEnv() must not be called in the browser");
  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
    contactTo: process.env.CONTACT_TO_EMAIL || "",
    contactFrom: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
    ipSalt: process.env.IP_HASH_SALT || "change-me",
  };
}
