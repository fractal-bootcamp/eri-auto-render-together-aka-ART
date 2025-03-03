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
        <body className="font-mono-cyber bg-cyber-darker min-h-screen text-terminal-green">
          <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-cyber-gradient opacity-5 pointer-events-none"></div>
            <Navigation />
            <main className="relative z-10 pt-16">
              <TRPCReactProvider>
                {children}
              </TRPCReactProvider>
            </main>

            {/* Auth Modal */}
            <SignedOut>
              <div className="fixed bottom-4 right-4 z-50">
                <AuthButtons />
              </div>
            </SignedOut>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
