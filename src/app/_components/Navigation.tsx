"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-purple-500/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-transparent bg-clip-text"
                    >
                        Fractal Dreams
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link
                            href="/artbuilder"
                            className={`text-sm ${isActive("/artbuilder")
                                ? "text-purple-300"
                                : "text-purple-400/60 hover:text-purple-300"
                                } transition-colors`}
                        >
                            Create
                        </Link>
                        <Link
                            href="/explore"
                            className={`text-sm ${isActive("/explore")
                                ? "text-purple-300"
                                : "text-purple-400/60 hover:text-purple-300"
                                } transition-colors`}
                        >
                            Explore
                        </Link>
                    </div>

                    {/* Auth Button (to be replaced with Clerk) */}
                    <div>
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 rounded-lg bg-purple-500/20 text-purple-200">
                        <span className="sr-only">Open menu</span>
                        ≡
                    </button>
                </div>
            </div>

            {/* Mobile Menu (hidden by default) */}
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <Link
                        href="/artbuilder"
                        className="block px-3 py-2 rounded-md text-base font-medium text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/20"
                    >
                        Create
                    </Link>
                    <Link
                        href="/explore"
                        className="block px-3 py-2 rounded-md text-base font-medium text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/20"
                    >
                        Explore
                    </Link>
                </div>
            </div>
        </nav>
    );
} 