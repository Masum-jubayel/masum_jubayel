"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { MemoriesManager, type MemoriesActions, type MemoryStatsRow } from "./MemoriesManager";
import { deleteMemory, saveMemory, setMemoryFlag } from "@/app/admin/actions";
import { uploadAny } from "@/lib/upload";

export function AdminMemories({ rows, avatar, name }: { rows: MemoryStatsRow[]; avatar: string; name: string }) {
  const router = useRouter();
  const actions = useMemo<MemoriesActions>(() => ({
    save: async (id, input) => { const r = await saveMemory(id, input); if (r.ok) router.refresh(); return r; },
    setFlag: async (id, f, v) => { await setMemoryFlag(id, f, v); router.refresh(); },
    remove: async (id) => { await deleteMemory(id); router.refresh(); },
    uploadImage: (file) => uploadAny(file, "memories"),
  }), [router]);
  return <MemoriesManager rows={rows} avatar={avatar} name={name} actions={actions} />;
}
