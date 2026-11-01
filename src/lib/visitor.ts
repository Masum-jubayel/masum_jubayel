import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { hashIp } from "@/lib/rateLimit";

/** Anonymous visitor id: a random httpOnly cookie, only ever stored as a salted hash (likes, guest comments). */
export async function visitorKey(create: boolean, purpose: "like" | "guest" = "like") {
  const jar = await cookies();
  let vid = jar.get("vid")?.value;
  if (!vid && create) {
    vid = randomUUID();
    jar.set("vid", vid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  if (!vid) return null;
  return purpose === "like" ? hashIp(`vid:${vid}`) : hashIp(`guest:${vid}`);
}

/** Names guests may not use (so nobody can pose as the site owner or staff). */
export function reservedName(name: string) {
  return /masum|jubayel|\badmin\b|moderator|\bauthor\b|site owner/i.test(name);
}
