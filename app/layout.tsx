import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { RoleSwitcher } from "@/components/role-switcher";
import { currentRole } from "@/lib/review/role";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Setu",
  description: "SME IPO draft prospectus builder",
};

/**
 * The one piece of persistent chrome in the app — there was none before S12.
 * The role switcher has to be reachable from every page, since it governs
 * what `/intake` shows and who the review actions log as the actor.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const role = await currentRole();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Document
            </Link>
            <Link href="/intake" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Intake
            </Link>
            <Link href="/review" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Review
            </Link>
            <Link href="/review/risks" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Risks
            </Link>
            <Link href="/review/audit" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Audit log
            </Link>
          </div>
          <RoleSwitcher current={role} />
        </nav>
        {children}
      </body>
    </html>
  );
}
