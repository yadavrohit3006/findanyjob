import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FindAnyJob — Search Jobs Across Platforms",
  description:
    "Find your next role by searching LinkedIn, Naukri, Instahyre and more in one place.",
  openGraph: {
    title: "FindAnyJob — Search Jobs Across Platforms",
    description: "Find your next role by searching LinkedIn, Naukri, Instahyre and more in one place.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} h-full bg-gray-50 text-gray-900 antialiased`}>
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
              <span className="text-2xl">💼</span> FindAnyJob
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/results" className="hover:text-indigo-600 transition-colors">
                Browse Jobs
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>

        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} FindAnyJob — Aggregating jobs from multiple platforms.
            Job listings are sourced from their respective platforms.
          </div>
        </footer>
      </body>
    </html>
  );
}
