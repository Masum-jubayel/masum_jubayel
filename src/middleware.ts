import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Refreshes the Supabase session cookie and protects /admin. No-op when Supabase isn't configured. */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin") && !data.user) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/comments/:path*", "/auth/:path*", "/login"],
};
