import { getEvent } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const { terminology, participantCounts } = event;

  const sections = [
    { key: "attendees", label: terminology.attendees, count: participantCounts.attendees },
    { key: "speakers", label: terminology.speakers, count: participantCounts.speakers },
    { key: "exhibitors", label: terminology.exhibitors, count: participantCounts.exhibitors },
    { key: "sponsors", label: terminology.sponsors, count: participantCounts.sponsors },
  ];

  const startDate = new Date(event.dates.start).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const endDate = new Date(event.dates.end).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/events" className="text-sm text-gray-500 hover:underline mb-6 block">
        ← All Events
      </Link>

      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          {event.category} · {event.industry}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <span>📅 {startDate} – {endDate}</span>
          <span>📍 {event.location.venue}, {event.location.city}, {event.location.country}</span>
        </div>
        <p className="text-gray-600 leading-relaxed">{event.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map(({ key, label, count }) => (
          <Link
            key={key}
            href={`/events/${event.id}/${key}`}
            className="rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <div className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">{label} →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
