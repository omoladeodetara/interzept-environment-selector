import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Last Price A/B Testing | Production UI Component Library",
  description: "A production-ready UI component library using shadcn/ui patterns and Tailwind CSS for pricing experiments and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
