import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://jianghongliang816.github.io/chenggui-daily-library";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "乘归每日选题库",
  description: "乘归账号的个人抖音热点视频、爆点拆解与口播稿资料库。",
  icons: {
    icon: `${siteUrl}/favicon.svg`,
    shortcut: `${siteUrl}/favicon.svg`,
  },
  openGraph: {
    title: "乘归每日选题库",
    description: "每天值得拍的短视频，已经替你筛好、拆好、写好。",
    images: [`${siteUrl}/og.svg`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
