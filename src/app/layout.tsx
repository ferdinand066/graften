import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Graften",
  description: "Digital Printing House & Advertising Agency Olsztyn",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-gradient-to-br from-red-50 to-white min-h-screen">
        <TRPCReactProvider>
          <Navbar />
          {children}
        </TRPCReactProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
