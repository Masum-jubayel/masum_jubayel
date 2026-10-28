import Link from "next/link";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { getContent } from "@/lib/content";

export async function AuthorCard() {
  const site = (await getContent()).site;
  return (
    <div className="glass flex items-center gap-4 p-5">
      <ImageSlot src={site.profilePhoto} alt={site.name} label="Author" person className="h-14 w-14 shrink-0 rounded-full [&_span]:hidden [&_svg]:h-5 [&_svg]:w-5" sizes="56px" />
      <div className="min-w-0">
        <p className="text-xs text-mist-500">Written by</p>
        <Link href="/about" className="font-medium text-mist-100 hover:text-cyan-200">{site.name}</Link>
        <p className="text-xs text-cyan-300">{site.title}</p>
      </div>
    </div>
  );
}
