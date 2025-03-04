import "./globals.css";
import { ClerkProvider, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "./_components/Navigation";
import { AuthButtons } from "./_components/AuthButtons";

export const metadata: Metadata = {
  title: "Auto-Render-Together",
  description: "Create and share holographic art in real-time",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans bg-pastel-lavender text-gray-700">
          <TRPCReactProvider>
            <Navigation />
            <SignedOut>
              <div className="fixed top-4 right-4 z-50">
                <AuthButtons />
              </div>
            </SignedOut>
            {children}
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
