import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cerebral People",
  description: "A community for adults with cerebral palsy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[radial-gradient(1200px_600px_at_20%_-10%,#FFF8F3,transparent),radial-gradient(1000px_600px_at_90%_10%,#FFEFE2,transparent)] bg-neutral-50`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
