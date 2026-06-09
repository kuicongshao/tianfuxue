import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天府学研究中心智能研究平台",
  description: "Tianfu Studies AI Platform for digital humanities research."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark">
      <body>{children}</body>
    </html>
  );
}
