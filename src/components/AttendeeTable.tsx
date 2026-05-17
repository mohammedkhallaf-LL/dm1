import Link from "next/link";
import type { Person } from "@/lib/types";

const TYPE_LABEL: Record<Person["participantType"], string> = {
  attendee: "Delegate",
  speaker: "Presenter",
  exhibitor_staff: "Staff",
  sponsor_contact: "Contact",
  other: "Guest",
};

export default function AttendeeTable({ persons }: { persons: Person[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="py-3 pr-4 text-left">Name / Company</th>
            <th className="py-3 pr-4 text-left">Position · Industry</th>
            <th className="py-3 pr-4 text-left">Location</th>
            <th className="py-3 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((person) => (
            <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 pr-4">
                <Link href={person.profileUrl} className="font-medium text-gray-900 hover:underline">
                  {person.fullName}
                </Link>
                <div className="text-xs text-gray-500">{person.company}</div>
              </td>
              <td className="py-3 pr-4">
                <div className="text-gray-700">{person.position}</div>
                <div className="text-xs text-gray-500">{person.industry}</div>
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {person.city}, {person.country}
              </td>
              <td className="py-3">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                  {TYPE_LABEL[person.participantType]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
