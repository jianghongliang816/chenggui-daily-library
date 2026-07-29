import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "乘归每日选题库",
  description: "乘归账号的私有抖音热点视频、爆点拆解与口播稿资料库。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "乘归每日选题库",
    description: "每天值得拍的短视频，已经替你筛好、拆好、写好。",
    images: ["/og.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
