import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthInitializer } from "@/components/auth-initializer";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Klear - Ton assistant budget personnel",
  description:
    "Klear est ton assistant personnel pour gérer ton budget. Il te permet de suivre tes dépenses, de planifier tes économies et de prendre des décisions financières.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthInitializer />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
