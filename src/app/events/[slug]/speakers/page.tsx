import { getPaginatedSpeakers } from "@/lib/data";
import SpeakerGrid from "@/components/SpeakerGrid";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SpeakersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = getPaginatedSpeakers(slug, 1);
  if (!result) notFound();
  const { items, totalPages, total, event } = result;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/events/${slug}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← {event.name}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.terminology.speakers}</h1>
      <p className="text-sm text-gray-500 mb-6">{total.toLocaleString()} on the program</p>
      <SpeakerGrid persons={items} />
      <Pagination page={1} totalPages={totalPages} baseHref={`/events/${slug}/speakers`} />
    </div>
  );
}
