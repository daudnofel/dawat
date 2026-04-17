import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dawat — The Muslim Events Platform",
  description: "Create beautiful events, RSVP with Inshallah, and bring your community together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-manrope)] bg-[#0D0D0D]">
        {children}
      </body>
    </html>
  );
}
