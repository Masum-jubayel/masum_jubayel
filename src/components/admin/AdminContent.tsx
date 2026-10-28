"use client";

import { useRouter } from "next/navigation";
import { ContentEditor } from "./ContentEditor";
import { resetContent, saveContent } from "@/app/admin/actions";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { uploadAny } from "@/lib/upload";
import type { ContentKey } from "@/content/cms";

export function AdminContent({ sectionKey, initial, isCustom }: { sectionKey: ContentKey; initial: unknown; isCustom: boolean }) {
  const router = useRouter();
  const upload = async (file: File) => {
    const sb = getBrowserSupabase();
    if (!sb) throw new Error("Supabase isn’t configured.");
    const path = `content/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`;
    const { error } = await sb.storage.from("gallery").upload(path, file, { contentType: file.type });
    if (error) throw error;
    return sb.storage.from("gallery").getPublicUrl(path).data.publicUrl;
  };
  const uploadPdf = async (file: File) => {
    const sb = getBrowserSupabase();
    if (!sb) throw new Error("Supabase isn’t configured.");
    if (file.type !== "application/pdf") throw new Error("Please choose a PDF.");
    const path = `docs/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`;
    const { error } = await sb.storage.from("resumes").upload(path, file, { contentType: "application/pdf" });
    if (error) throw error;
    return sb.storage.from("resumes").getPublicUrl(path).data.publicUrl;
  };
  return (
    <ContentEditor
      key={sectionKey}
      sectionKey={sectionKey}
      initial={initial}
      isCustom={isCustom}
      uploadImage={upload}
      uploadFile={uploadPdf}
      uploadAny={(f) => uploadAny(f, "content")}
      onSave={async (v) => { const r = await saveContent(sectionKey, v); if (r.ok) router.refresh(); return r; }}
      onReset={async () => { const r = await resetContent(sectionKey); if (r.ok) router.refresh(); return r; }}
    />
  );
}
