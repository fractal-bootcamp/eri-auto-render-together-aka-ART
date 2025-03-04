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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-terminal-blue-dark">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="font-mono text-xl font-semibold text-terminal-gray"
                    >
                        auto-render-together
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex justify-center items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                        <SignedIn>
                            <Link
                                href="/artbuilder"
                                className={`font-mono px-4 py-1 rounded ${isActive("/artbuilder")
                                    ? "bg-terminal-lime text-terminal-gray border terminal-border-green"
                                    : "text-terminal-gray hover:bg-terminal-lime/30"
                                    } transition-colors`}
                            >
                                &gt; Create
                            </Link>
                            <Link
                                href="/explore"
                                className={`font-mono px-4 py-1 rounded ${isActive("/explore")
                                    ? "bg-terminal-blue text-terminal-gray border terminal-border"
                                    : "text-terminal-gray hover:bg-terminal-blue/30"
                                    } transition-colors`}
                            >
                                &gt; Explore
                            </Link>
                        </SignedIn>
                        <SignedOut>
                            <span className="font-mono text-terminal-gray/60">
                                Sign in to create and explore
                            </span>
                        </SignedOut>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:block">
                        <AuthButtons />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button className="text-terminal-gray hover:text-terminal-gray focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 bg-cyber-black/90 border-t border-terminal-green/20">
                    <SignedIn>
                        <Link
                            href="/artbuilder"
                            className="font-medium text-gray-600 hover:text-pastel-blue hover:border-b-2 hover:border-pastel-blue/50"
                        >
                            Create
                        </Link>
                        <Link
                            href="/explore"
                            className="font-medium text-gray-600 hover:text-pastel-blue hover:border-b-2 hover:border-pastel-blue/50"
                        >
                            Explore
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