import { getCompany } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Person } from "@/lib/types";

export default async function ExhibitorProfilePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const result = getCompany(slug, id);
  if (!result) notFound();
  const { company, event } = result;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/events/${slug}/exhibitors`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← {event.terminology.exhibitors}
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xl text-gray-400 font-bold">
          {company.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <div className="text-gray-600">{company.industry} · {company.size} employees</div>
          <div className="text-sm text-gray-500 mt-1">{company.city}, {company.country}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t border-b border-gray-100 py-4 mb-6">
        <span>🌐 <a href={company.website} className="text-blue-600 hover:underline">{company.website}</a></span>
        <span>📞 {company.phone}</span>
        <span>📍 {company.address}</span>
        {company.boothNumber && <span className="text-green-700 font-medium">Booth {company.boothNumber} · {company.hall}</span>}
      </div>

      <p className="text-gray-600 mb-8">{company.description}</p>

      {company.contacts.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
            Staff ({company.contacts.length})
          </h2>
          <div className="space-y-3">
            {company.contacts.map((person: Person) => (
              <Link
                key={person.id}
                href={person.profileUrl}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-gray-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-sm text-gray-500 font-medium">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{person.fullName}</div>
                  <div className="text-sm text-gray-500">{person.position}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
