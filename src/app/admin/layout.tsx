import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getAdmin, getSessionUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <section className="container-x pb-16 pt-32">
        <div className="glass mx-auto max-w-xl p-8">
          <h1 className="text-2xl font-semibold">Admin is not configured</h1>
          <p className="mt-3 text-sm text-mist-300">Add your Supabase environment variables and run <code className="text-cyan-300">supabase/schema.sql</code>. See the README.</p>
        </div>
      </section>
    );
  }
  const admin = await getAdmin();
  if (!admin) {
    const { user } = await getSessionUser();
    return (
      <section className="container-x pb-16 pt-32">
        <div className="glass mx-auto max-w-xl p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-300" aria-hidden />
          <h1 className="mt-4 text-2xl font-semibold">Not authorized</h1>
          <p className="mt-3 text-sm text-mist-300">{user ? `${user.email} is not an administrator.` : "Please sign in."}</p>
          <div className="mt-6 flex justify-center gap-3">
            {user ? <form action="/auth/signout" method="post"><button className="btn-secondary">Sign out</button></form> : <Link href="/login?next=/admin" className="btn-primary">Sign in</Link>}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="container-x pb-16 pt-28">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Admin console</p>
          <p className="mt-1 text-sm text-mist-400">Signed in as {admin.user.email}</p>
        </div>
        <form action="/auth/signout" method="post"><button className="btn-secondary py-2 text-xs">Sign out</button></form>
      </div>
      {children}
    </section>
  );
}
