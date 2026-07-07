import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthInitializer } from "@/components/auth-initializer";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${fredoka.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthInitializer />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
