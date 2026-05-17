import { getEvent } from "@/lib/data";
import SponsorTiers from "@/components/SponsorTiers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SponsorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/events/${slug}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← {event.name}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.terminology.sponsors}</h1>
      <p className="text-sm text-gray-500 mb-6">{event.sponsors.length} organizations</p>
      <SponsorTiers companies={event.sponsors} />
    </div>
  );
}
