"use client";

import { useState } from "react";

interface GatedSectionProps {
  gatedInterests: string[];
}

export default function GatedSection({ gatedInterests }: GatedSectionProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mt-4">
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Request Info
        </button>
      ) : (
        <div className="rounded bg-gray-50 border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Additional Buying Preferences
          </div>
          <div className="flex flex-wrap gap-2">
            {gatedInterests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
