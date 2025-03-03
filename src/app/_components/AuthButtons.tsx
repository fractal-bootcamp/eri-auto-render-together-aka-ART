"use client";

import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function AuthButtons() {
    return (
        <div className="flex gap-4 items-center">
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="terminal-button">
                        _login
                    </button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <button className="terminal-button">
                        _register
                    </button>
                </SignUpButton>
            </SignedOut>

            <SignedIn>
                <UserButton
                    appearance={{
                        elements: {
                            rootBox: "terminal-text",
                            avatarBox: "border-2 border-terminal-green hover:border-terminal-green/60 transition-colors",
                            userPreviewMainIdentifier: "terminal-text text-terminal-green",
                            userPreviewSecondaryIdentifier: "terminal-text text-terminal-green/60",
                            userButtonPopoverCard: "bg-cyber-black border border-terminal-green/20 shadow-terminal",
                            userButtonPopoverActions: "terminal-text",
                            userButtonPopoverActionButton: "terminal-text hover:bg-terminal-green/10",
                        }
                    }}
                />
            </SignedIn>
        </div>
    );
} 