import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Louder | AI Event Concierge",
  description:
    "Corporate offsite planning UI built with Next.js, Tailwind CSS, and shadcn-style components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
