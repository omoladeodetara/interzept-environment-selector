import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenting Bank - AI Agent Banking Platform",
  description: "Banking platform for AI agents with HTTP 402 payment authorization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
            <div className="container mx-auto px-4">
              <nav className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                  <span className="text-2xl">🏦</span>
                  Agenting Bank
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/accounts"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Accounts
                  </Link>
                  <Link
                    href="/transactions"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Transactions
                  </Link>
                  <Link
                    href="/billing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Billing
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4">
              <p>Agenting Bank • AI Agent Banking Platform • HTTP 402 Payment Required Demo</p>
              <p className="mt-2 text-xs">
                Built with Next.js 16, React 19, shadcn/ui, and Tailwind CSS v4
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
