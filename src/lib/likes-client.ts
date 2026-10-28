"use client";

/** Browser-side likes API (posts & comments). The preview build swaps this file for a local-only version. */
export type LikeType = "post" | "comment" | "memory";
export type LikeState = { configured: boolean; counts: Record<string, number>; mine: string[] };

export async function fetchLikes(type: LikeType, ids: string[]): Promise<LikeState> {
  if (!ids.length) return { configured: true, counts: {}, mine: [] };
  const res = await fetch(`/api/likes?type=${type}&ids=${ids.map(encodeURIComponent).join(",")}`, { cache: "no-store" });
  if (!res.ok) return { configured: false, counts: {}, mine: [] };
  return res.json();
}

export async function toggleLike(type: LikeType, id: string): Promise<{ liked: boolean; count: number }> {
  const res = await fetch("/api/likes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn’t save your like.");
  return data;
}
