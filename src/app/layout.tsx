import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uranai App - Fortune Telling",
  description: "Fortune telling app with numerology, tarot, and Mayan calendar features",
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
