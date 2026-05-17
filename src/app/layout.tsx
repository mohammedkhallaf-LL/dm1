import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Directory",
  description: "Browse upcoming events and participants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200 px-6 py-4">
          <a href="/events" className="text-lg font-semibold text-gray-900 hover:text-gray-600">
            Event Directory
          </a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
