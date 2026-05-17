import { getPerson } from "@/lib/data";
import ProfilePage from "@/components/ProfilePage";
import { notFound } from "next/navigation";

export default async function SpeakerProfilePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const result = getPerson(slug, id);
  if (!result) notFound();
  const { person, event } = result;

  return (
    <ProfilePage
      person={person}
      event={event}
      sectionLabel={event.terminology.speakers}
      sectionHref={`/events/${slug}/speakers`}
    />
  );
}
