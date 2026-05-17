import Link from "next/link";
import type { EventSummary } from "@/lib/types";

export default function EventListItem({ event }: { event: EventSummary }) {
  const start = new Date(event.dates.start);
  const day = start.getDate();
  const month = start.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const total =
    event.participantCounts.attendees +
    event.participantCounts.speakers +
    event.participantCounts.exhibitors +
    event.participantCounts.sponsors;

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-5 border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors px-4"
    >
      <div className="w-14 shrink-0 rounded bg-gray-100 py-2 text-center">
        <div className="text-2xl font-bold leading-none text-gray-800">{day}</div>
        <div className="text-xs text-gray-500 mt-0.5">{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{event.name}</div>
        <div className="text-sm text-gray-500 mt-0.5">
          {event.location.city}, {event.location.country} · {total.toLocaleString()} participants
        </div>
        <div className="text-sm text-gray-400 mt-0.5">
          {event.category} · {event.industry}
        </div>
      </div>
      <div className="text-gray-400 text-sm shrink-0">View →</div>
    </Link>
  );
}
