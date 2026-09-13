import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Finance",
  description: "SME IPO draft prospectus builder",
};

/**
 * The one piece of persistent chrome in the app — there was none before S12.
 * A left sidebar replaces the old top bar now that there are enough
 * destinations (Home, Eligibility, Document, Intake, Review, Risks, Audit
 * log) to need real navigation, not a single wrapping row. The role switcher
 * used to live here too; it moved to `/intake` (`RolePicker`) so choosing who
 * you are and seeing that person's modules happen in one place.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
    >
      <body className="h-full min-h-full">
        <TooltipProvider>
          <SidebarProvider>
            <Sidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
