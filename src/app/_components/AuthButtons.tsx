"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function AuthButtons() {
    return (
        <div className="flex items-center gap-4">
            <SignedIn>
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            userButtonAvatarBox: "border-2 border-pastel-blue hover:border-pastel-pink transition-colors",
                        },
                    }}
                />
            </SignedIn>

            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-white hover:bg-pastel-blue/20 text-gray-700 rounded-md border border-pastel-blue/30 shadow-soft transition-colors">
                        Sign in
                    </button>
                </SignInButton>

                <SignUpButton mode="modal">
                    <button className="px-4 py-2 bg-pastel-blue hover:bg-pastel-blue/80 text-gray-700 rounded-md shadow-soft transition-colors">
                        Sign up
                    </button>
                </SignUpButton>
            </SignedOut>
        </div>
    );
} 