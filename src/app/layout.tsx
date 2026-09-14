import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reflection Reading | 迷いを、やさしく言語化する",
  description: "未来を断定せず、今の気持ちを整理して今日の一歩を見つける短いリフレクションReading。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
