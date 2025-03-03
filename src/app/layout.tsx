import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "./_components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
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
      <body className={`font-sans ${inter.variable} bg-gradient-to-br from-black via-purple-900 to-black min-h-screen`}>
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
