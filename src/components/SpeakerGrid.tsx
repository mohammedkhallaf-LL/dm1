import Link from "next/link";
import type { Person } from "@/lib/types";

export default function SpeakerGrid({ persons }: { persons: Person[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {persons.map((person) => {
        const primarySession = person.sessions?.[0];
        return (
          <Link
            key={person.id}
            href={person.profileUrl}
            className="rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all block"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-400 text-lg font-semibold">
                {person.firstName[0]}{person.lastName[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{person.fullName}</div>
                <div className="text-sm text-gray-500 truncate">{person.position}</div>
                <div className="text-sm text-gray-400 truncate">{person.company}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span>📍 {person.city}</span>
              {person.linkedin && <span>🔗 LinkedIn</span>}
            </div>
            {primarySession && (
              <div className="mt-2">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-700">
                  {primarySession.track}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
