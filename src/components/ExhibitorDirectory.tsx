import Link from "next/link";
import type { Company } from "@/lib/types";

export default function ExhibitorDirectory({ companies }: { companies: Company[] }) {
  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <Link
          key={company.id}
          href={`/events/${company.eventId}/exhibitors/${company.id}`}
          className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded bg-gray-100 shrink-0 flex items-center justify-center text-xs text-gray-400 font-semibold">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">{company.name}</div>
            <div className="text-sm text-gray-500">
              {company.industry} · {company.city}, {company.country}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              🌐 {company.website} · 📞 {company.phone}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-medium text-green-700">{company.boothNumber}</div>
            <div className="text-xs text-gray-500">{company.hall}</div>
            <div className="text-xs text-blue-600 mt-1">{company.contacts.length} contacts →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
