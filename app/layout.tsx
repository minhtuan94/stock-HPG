import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "Trạm Phân tích HPG",
  description: "Bảng điều khiển tổng hợp dữ liệu HPG thời gian thực và khuyến nghị theo xác suất",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${mono.variable} ${grotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
