import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SME Banking",
  description: "AI-Powered SME Banking Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
