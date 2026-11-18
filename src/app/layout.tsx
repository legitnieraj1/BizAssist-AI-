import type { Metadata } from "next";
import { Imbue, Victor_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";

const imbue = Imbue({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-imbue",
  display: "swap",
});

const victorMono = Victor_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-victor-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BIZASSIST AI — AI-POWERED CUSTOMER SUPPORT & TICKET MANAGEMENT",
  description: "Intelligent customer support and ticket management platform by Team 3. Smarter Support. Faster Resolutions.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${imbue.variable} ${victorMono.variable}`}>
      <body className="min-h-screen bg-brand-offwhite text-brand-black flex flex-col font-mono selection:bg-brand-accent selection:text-brand-black">
        <Navigation />
        <main className="flex-1">{children}</main>
        <ChatWidget embedded={false} />
      </body>
    </html>
  );
}
