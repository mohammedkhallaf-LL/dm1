import Link from "next/link";
import type { Company } from "@/lib/types";

const TIER_STYLE = {
  gold: { label: "🥇 Gold", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  silver: { label: "🥈 Silver", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
  bronze: { label: "🥉 Bronze", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
};

export default function SponsorTiers({ companies }: { companies: Company[] }) {
  const gold = companies.filter((c) => c.sponsorTier === "gold");
  const silver = companies.filter((c) => c.sponsorTier === "silver");
  const bronze = companies.filter((c) => c.sponsorTier === "bronze");

  return (
    <div className="space-y-8">
      {([["gold", gold], ["silver", silver], ["bronze", bronze]] as const).map(
        ([tier, items]) =>
          items.length > 0 && (
            <section key={tier}>
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${TIER_STYLE[tier].text}`}>
                {TIER_STYLE[tier].label}
              </h2>
              <div className="space-y-2">
                {items.map((company) => (
                  <Link
                    key={company.id}
                    href={`/events/${company.eventId}/sponsors/${company.id}`}
                    className={`flex items-center justify-between rounded-lg border p-4 ${TIER_STYLE[tier].bg} ${TIER_STYLE[tier].border} hover:shadow-sm transition-shadow`}
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">
                        {company.website} · {company.country}
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 shrink-0">
                      {company.contacts.length} contacts →
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
      )}
    </div>
  );
}
