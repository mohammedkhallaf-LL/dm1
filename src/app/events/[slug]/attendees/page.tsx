import { getPaginatedAttendees } from "@/lib/data";
import AttendeeTable from "@/components/AttendeeTable";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AttendeesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = getPaginatedAttendees(slug, 1);
  if (!result) notFound();
  const { items, totalPages, total, event } = result;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href={`/events/${slug}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← {event.name}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.terminology.attendees}</h1>
      <p className="text-sm text-gray-500 mb-6">{total.toLocaleString()} registered</p>
      <AttendeeTable persons={items} />
      <Pagination page={1} totalPages={totalPages} baseHref={`/events/${slug}/attendees`} />
    </div>
  );
}
