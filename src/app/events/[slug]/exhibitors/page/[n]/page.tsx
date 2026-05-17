import { getPaginatedExhibitors } from "@/lib/data";
import ExhibitorDirectory from "@/components/ExhibitorDirectory";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ExhibitorsPageN({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const page = parseInt(n, 10);
  if (isNaN(page) || page < 2) notFound();

  const result = getPaginatedExhibitors(slug, page);
  if (!result || result.items.length === 0) notFound();
  const { items, totalPages, total, event } = result;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/events/${slug}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← {event.name}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.terminology.exhibitors}</h1>
      <p className="text-sm text-gray-500 mb-6">{total.toLocaleString()} companies · Page {page} of {totalPages}</p>
      <ExhibitorDirectory companies={items} />
      <Pagination page={page} totalPages={totalPages} baseHref={`/events/${slug}/exhibitors`} />
    </div>
  );
}
