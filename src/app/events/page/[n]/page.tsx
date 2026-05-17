import { getPaginatedEvents } from "@/lib/data";
import EventListItem from "@/components/EventListItem";
import Pagination from "@/components/Pagination";
import { notFound } from "next/navigation";

export default async function EventsPageN({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const page = parseInt(n, 10);
  if (isNaN(page) || page < 2) notFound();

  const { items, totalPages, total } = getPaginatedEvents(page);
  if (items.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Upcoming Events</h1>
      <p className="text-sm text-gray-500 mb-6">{total} events · Page {page} of {totalPages}</p>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {items.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} baseHref="/events" />
    </div>
  );
}
