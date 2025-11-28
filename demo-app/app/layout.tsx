import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pricing Optimizer Demo",
  description: "Demo application for the Hybrid Multi-Tenant Pricing Optimizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4">
              <nav className="flex items-center justify-between h-16">
                <Link href="/" className="font-bold text-xl text-primary">
                  Pricing Optimizer
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/experiments"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Experiments
                  </Link>
                  <Link
                    href="/recommendations"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Recommendations
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Settings
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <p>Pricing Optimizer Demo App • Built with Next.js 16 + React 19</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
