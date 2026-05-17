import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseHref: string;
}

export default function Pagination({ page, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevHref = page > 1 ? (page === 2 ? baseHref : `${baseHref}/page/${page - 1}`) : null;
  const nextHref = page < totalPages ? `${baseHref}/page/${page + 1}` : null;

  return (
    <nav className="flex items-center justify-center gap-6 py-8 text-sm text-gray-500">
      {prevHref ? (
        <Link href={prevHref} className="hover:text-gray-900">
          ← Prev
        </Link>
      ) : (
        <span className="opacity-30">← Prev</span>
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className="hover:text-gray-900">
          Next →
        </Link>
      ) : (
        <span className="opacity-30">Next →</span>
      )}
    </nav>
  );
}
