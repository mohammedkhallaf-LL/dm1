import { getPaginatedEvents } from "@/lib/data";
import EventListItem from "@/components/EventListItem";
import Pagination from "@/components/Pagination";

export default function EventsPage() {
  const { items, totalPages, total } = getPaginatedEvents(1);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Upcoming Events</h1>
      <p className="text-sm text-gray-500 mb-6">{total} events</p>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {items.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
      <Pagination page={1} totalPages={totalPages} baseHref="/events" />
    </div>
  );
}
