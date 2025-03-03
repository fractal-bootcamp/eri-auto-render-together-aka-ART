"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AuthButtons } from "./AuthButtons";

export function Navigation() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/80 backdrop-blur-xl border-b border-terminal-green/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="font-cyber text-xl font-bold glitch"
                    >
                        auto-render-together
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex justify-center items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                        <SignedIn>
                            <Link
                                href="/artbuilder"
                                className={`terminal-text ${isActive("/artbuilder")
                                    ? "text-terminal-green shadow-terminal"
                                    : "text-terminal-green/60 hover:text-terminal-green hover:shadow-terminal"
                                    } transition-all duration-300`}
                            >
                                &gt; Create
                            </Link>
                            <Link
                                href="/explore"
                                className={`terminal-text ${isActive("/explore")
                                    ? "text-terminal-green shadow-terminal"
                                    : "text-terminal-green/60 hover:text-terminal-green hover:shadow-terminal"
                                    } transition-all duration-300`}
                            >
                                &gt; Explore
                            </Link>
                        </SignedIn>
                        <SignedOut>
                            <span className="terminal-text text-terminal-green/40">
                                &gt; Sign in to create and explore
                            </span>
                        </SignedOut>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:block">
                        <AuthButtons />
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden terminal-button">
                        <span className="sr-only">Open menu</span>
                        &gt;_
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 bg-cyber-black/90 border-t border-terminal-green/20">
                    <SignedIn>
                        <Link
                            href="/artbuilder"
                            className="terminal-text block px-3 py-2 text-terminal-green/60 hover:text-terminal-green hover:bg-terminal-green/10"
                        >
                            &gt; Create
                        </Link>
                        <Link
                            href="/explore"
                            className="terminal-text block px-3 py-2 text-terminal-green/60 hover:text-terminal-green hover:bg-terminal-green/10"
                        >
                            &gt; Explore
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <div className="px-3 py-2">
                            <AuthButtons />
                        </div>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
} 