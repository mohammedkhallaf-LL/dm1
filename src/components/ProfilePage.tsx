import Link from "next/link";
import type { Person, EventSummary } from "@/lib/types";
import GatedSection from "./GatedSection";

interface ProfilePageProps {
  person: Person;
  event: EventSummary;
  sectionLabel: string;
  sectionHref: string;
}

function roleLabel(person: Person, sectionLabel: string): string {
  if (person.participantType === "speaker") {
    const singularSection = sectionLabel.replace(/s$/, "");
    return `${singularSection} · ${person.sessions?.[0]?.track ?? singularSection}`;
  }
  if (person.participantType === "exhibitor_staff") return `${person.company} Staff`;
  if (person.participantType === "sponsor_contact") {
    return person.sponsorTier
      ? `${person.sponsorTier.charAt(0).toUpperCase() + person.sponsorTier.slice(1)} Partner Contact`
      : "Partner Contact";
  }
  return sectionLabel.endsWith("s") ? sectionLabel.slice(0, -1) : sectionLabel;
}

export default function ProfilePage({ person, event, sectionLabel, sectionHref }: ProfilePageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href={`/events/${event.id}`} className="hover:underline">{event.name}</Link>
        <span>›</span>
        <Link href={sectionHref} className="hover:underline">{sectionLabel}</Link>
        <span>›</span>
        <span className="text-gray-800">{person.fullName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-5 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-2xl text-gray-400 font-semibold">
          {person.firstName[0]}{person.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{person.fullName}</h1>
          <div className="text-gray-600 mt-1">{person.position}</div>
          <div className="text-gray-500">{person.company}</div>
          <div className="mt-1 text-sm text-gray-400">{roleLabel(person, sectionLabel)}</div>
        </div>
      </div>

      {/* Contact icons */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 border-t border-b border-gray-100 py-4">
        <span>📍 {person.city}, {person.country}</span>
        <span>✉️ {person.email}</span>
        {person.companyPhone && <span>📞 {person.companyPhone}</span>}
        {person.linkedin && (
          <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            🔗 LinkedIn
          </a>
        )}
        {person.twitter && (
          <a href={person.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            🐦 Twitter
          </a>
        )}
        {person.instagram && (
          <a href={person.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
            📸 Instagram
          </a>
        )}
      </div>

      {/* Bio */}
      {person.bio && (
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{person.bio}</p>
        </div>
      )}

      {/* Industry & Interests */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Industry & Interests</h2>
        <div className="mb-1 text-sm text-gray-700">{person.industry}</div>
        <div className="flex flex-wrap gap-2">
          {person.interests.map((interest) => (
            <span key={interest} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {interest}
            </span>
          ))}
        </div>
      </section>

      {/* Event types organized */}
      {person.eventTypesOrganized && person.eventTypesOrganized.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Event Types</h2>
          <div className="flex flex-wrap gap-2">
            {person.eventTypesOrganized.map((t) => (
              <span key={t} className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs text-blue-700">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Sessions (speakers) */}
      {person.sessions && person.sessions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Sessions</h2>
          <div className="space-y-2">
            {person.sessions.map((session) => (
              <div key={session.id} className="rounded border border-gray-200 p-3 text-sm">
                <div className="font-medium text-gray-800">{session.title}</div>
                <div className="text-gray-500 mt-1 text-xs">
                  {session.day} · {session.time} · {session.track} · {session.room}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Meeting availability */}
      {person.allowMeeting && person.meetingSlots && person.meetingSlots.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Available for Meetings</h2>
          <div className="flex flex-wrap gap-2">
            {person.meetingSlots.map((slot) => (
              <span key={slot} className="rounded bg-green-50 border border-green-200 px-3 py-1 text-xs text-green-700">
                {slot}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Company section (exhibitor/sponsor contacts) */}
      {(person.participantType === "exhibitor_staff" || person.participantType === "sponsor_contact") && (
        <section className="mb-6 rounded-lg border border-gray-200 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Company</h2>
          <div className="text-sm space-y-1 text-gray-700">
            <div className="font-semibold text-gray-900">{person.company}</div>
            <div>🌐 <a href={person.companyWebsite} className="text-blue-600 hover:underline">{person.companyWebsite}</a></div>
            <div>📞 {person.companyPhone}</div>
            {person.boothNumber && (
              <div className="text-green-700">Booth {person.boothNumber} · {person.hall}</div>
            )}
            {person.sponsorTier && (
              <div className="capitalize text-amber-600">{person.sponsorTier} Partner</div>
            )}
          </div>
        </section>
      )}

      {/* Gated section */}
      {person.hasGatedSection && person.gatedInterests && (
        <section className="mb-6">
          <GatedSection gatedInterests={person.gatedInterests} />
        </section>
      )}
    </div>
  );
}
