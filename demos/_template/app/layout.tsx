import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo App - Last Price Integration Example",
  description: "A demo application showing how to integrate Last Price for pricing experiments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="font-bold">Your Product</span>
                </a>
              </div>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <a href="/pricing" className="transition-colors hover:text-foreground/80">
                  Pricing
                </a>
                <a href="/features" className="transition-colors hover:text-foreground/80">
                  Features
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground">
                Demo powered by{" "}
                <a href="https://github.com/omoladeodetara/last-price" className="font-medium underline underline-offset-4">
                  Last Price
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
