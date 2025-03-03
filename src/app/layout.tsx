import "./globals.css";
import type { Metadata } from "next";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "./_components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fractal Dreams",
  description: "Create and share holographic art in real-time",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload fonts to avoid FOUT (Flash of Unstyled Text) */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
          as="style"
        />
      </head>
      <body className="font-cyber">
        <div className="min-h-screen backdrop-blur-sm">
          <Navigation />
          <div className="container mx-auto px-4 pt-16">
            <TRPCReactProvider>
              {children}
            </TRPCReactProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
