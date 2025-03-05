"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

interface Artwork {
    id: string | number;
    title: string;
    creator: string;
    likes: number;
    isLiked: boolean;
    imageUrl?: string;
    timestamp?: number;
    harmonic_parameters?: {
        base_frequency?: number;
        harmonic_ratio?: number;
        wave_number?: number;
        damping?: number;
        amplitude?: number;
        mode?: string;
        color_scheme?: string;
        resolution?: number;
    };
}

interface DbArtwork {
    id: string;
    name: string;
    code: string;
    thumbnail: string | null;
    createdAt: Date;
    userId: string;
    isPublic: boolean;
    user?: {
        name: string | null;
        email: string;
    };
    _count?: {
        likes: number;
    };
}

export default function ExplorePage() {
    const router = useRouter();
    const { user, isSignedIn } = useUser();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);
    const [pendingLikeId, setPendingLikeId] = useState<string | number | null>(null);

    // Store the current page URL when component mounts
    useEffect(() => {
        // Store that we're on the explore page
        localStorage.setItem('lastVisitedPage', '/explore');
    }, []);

    // Check if we were redirected from login and should be on explore page
    useEffect(() => {
        // If we just logged in and were previously on the explore page
        if (isSignedIn && window.location.pathname === '/artbuilder') {
            const lastPage = localStorage.getItem('lastVisitedPage');
            if (lastPage === '/explore') {
                console.log('Redirecting back to explore page after login');
                // Clear the stored page to prevent redirect loops
                localStorage.removeItem('lastVisitedPage');
                // Redirect back to explore page
                router.push('/explore');
            }
        }
    }, [isSignedIn, router]);

    // Fetch public artworks from the database
    const { data: dbArtworks, isLoading: isDbLoading } = api.art.getPublic.useQuery(undefined, {
        enabled: true,
        refetchOnWindowFocus: false,
    });

    // Toggle like mutation
    const toggleLikeMutation = api.art.toggleLike.useMutation({
        onSuccess: (result, variables) => {
            // Update the local state after successful like/unlike
            setArtworks(prev =>
                prev.map(artwork => {
                    if (artwork.id === variables.configId) {
                        return {
                            ...artwork,
                            likes: result.liked ? artwork.likes + 1 : artwork.likes - 1,
                            isLiked: result.liked
                        };
                    }
                    return artwork;
                })
            );
        }
    });

    // Load artworks and user likes from localStorage and database
    useEffect(() => {
        setIsLoading(true);

        // Load user likes from localStorage
        const savedLikes = localStorage.getItem('userLikes');
        let likedArtworkIds: (string | number)[] = [];

        if (savedLikes) {
            try {
                likedArtworkIds = JSON.parse(savedLikes);
                console.log("Loaded user likes from localStorage:", likedArtworkIds);
            } catch (error) {
                console.error("Error parsing saved likes:", error);
            }
        }

        // Load user uploaded artworks from localStorage
        const savedArtworks = localStorage.getItem('sharedArtworks');
        let localArtworks: Artwork[] = [];

        if (savedArtworks) {
            try {
                const parsedArtworks = JSON.parse(savedArtworks);
                localArtworks = Array.isArray(parsedArtworks) ? parsedArtworks : [parsedArtworks];

                // Assign unique IDs to user artworks starting from 1000
                localArtworks = localArtworks.map((artwork, index) => ({
                    ...artwork,
                    id: typeof artwork.id === 'string' ? artwork.id : 1000 + index,
                    likes: artwork.likes || 0,
                    isLiked: likedArtworkIds.includes(artwork.id)
                }));

                console.log("Loaded local artworks:", localArtworks.length);
            } catch (error) {
                console.error("Error parsing saved artworks:", error);
            }
        }

        // Create sample artworks if no local or DB artworks exist
        const sampleArtworks: Artwork[] = !dbArtworks?.length && !localArtworks.length
            ? Array.from({ length: 6 }).map((_, i) => ({
                id: i,
                title: "Sample Artwork",
                creator: "ART System",
                likes: Math.floor(Math.random() * 100),
                isLiked: likedArtworkIds.includes(i)
            }))
            : [];

        // Convert DB artworks to the Artwork interface format
        const dbArtworksFormatted = (dbArtworks
            ? dbArtworks.map(dbArt => {
                // Parse the code to get harmonic parameters
                let harmonic_parameters;
                try {
                    const parsedCode = JSON.parse(dbArt.code);

                    // Check if the code has a harmonic_parameters field (new format)
                    if (parsedCode.harmonic_parameters) {
                        harmonic_parameters = parsedCode.harmonic_parameters;
                    } else {
                        // Fall back to the old format
                        harmonic_parameters = {
                            base_frequency: parsedCode.baseFrequency,
                            harmonic_ratio: parsedCode.harmonicRatio,
                            wave_number: parsedCode.waveNumber,
                            damping: parsedCode.damping,
                            amplitude: parsedCode.amplitude,
                            mode: parsedCode.mode,
                            color_scheme: parsedCode.colorScheme,
                            resolution: parsedCode.resolution
                        };
                    }
                } catch (error) {
                    console.error("Error parsing artwork code:", error);
                }

                // Determine the creator name
                let creatorName = "Anonymous Artist";

                // Check if user exists and has a name
                if (dbArt.user) {
                    if (dbArt.user.name) {
                        creatorName = dbArt.user.name;
                    } else {
                        creatorName = "Anonymous";
                    }
                }

                return {
                    id: dbArt.id,
                    title: dbArt.name,
                    creator: creatorName,
                    likes: dbArt._count?.likes || 0,
                    isLiked: likedArtworkIds.includes(dbArt.id),
                    imageUrl: dbArt.thumbnail || undefined,
                    timestamp: dbArt.createdAt.getTime(),
                    harmonic_parameters
                };
            })
            : []) as Artwork[];

        console.log("Loaded DB artworks:", dbArtworksFormatted.length);

        // Combine all artworks, prioritizing DB artworks
        const combinedArtworks = [...dbArtworksFormatted, ...localArtworks, ...sampleArtworks];

        setArtworks(combinedArtworks);
        setIsLoading(false);
    }, [dbArtworks]);

    // Check for pending likes when user signs in
    useEffect(() => {
        if (isSignedIn) {
            const pendingLike = localStorage.getItem('pendingLike');
            if (pendingLike) {
                console.log(`User signed in, processing pending like for artwork ID: ${pendingLike}`);

                // Clear the pending like
                localStorage.removeItem('pendingLike');

                // Only process if it's a database artwork (string ID)
                if (pendingLike.startsWith('cl') || pendingLike.length > 8) {
                    console.log(`Processing pending like for database artwork ID: ${pendingLike}`);
                    toggleLikeMutation.mutate({ configId: pendingLike });
                } else {
                    // For local artworks (numeric IDs)
                    const numericId = parseInt(pendingLike, 10);
                    if (!isNaN(numericId)) {
                        console.log(`Processing pending like for local artwork ID: ${numericId}`);

                        // Update artworks state
                        setArtworks(prevArtworks =>
                            prevArtworks.map(artwork => {
                                if (artwork.id === numericId) {
                                    return {
                                        ...artwork,
                                        likes: artwork.likes + 1,
                                        isLiked: true
                                    };
                                }
                                return artwork;
                            })
                        );

                        // Update localStorage to persist user likes
                        const savedLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
                        localStorage.setItem('userLikes', JSON.stringify([...savedLikes, numericId]));
                    }
                }
            }
        }
    }, [isSignedIn, toggleLikeMutation]);

    // Function to handle sign in from prompt
    const handleClosePrompt = () => {
        // Close the prompt
        setShowSignInPrompt(false);
    };

    const handleLike = (id: string | number) => {
        // If the user is not signed in, show sign-in prompt
        if (!isSignedIn) {
            // Store the artwork ID they wanted to like
            localStorage.setItem('pendingLike', String(id));
            setPendingLikeId(id);
            // Make sure we know to return to explore page
            localStorage.setItem('lastVisitedPage', '/explore');
            setShowSignInPrompt(true);
            return;
        }

        // For database artworks (string IDs)
        if (typeof id === 'string') {
            console.log(`Toggling like for artwork ID: ${id}`);

            // Use the tRPC mutation to toggle like in the database
            toggleLikeMutation.mutate({ configId: id });
        } else {
            // For local artworks (numeric IDs)
            console.log(`Toggling like for local artwork ID: ${id}`);

            // Update artworks state
            setArtworks(artworks.map(artwork => {
                if (artwork.id === id) {
                    const newIsLiked = !artwork.isLiked;
                    return {
                        ...artwork,
                        likes: newIsLiked ? artwork.likes + 1 : artwork.likes - 1,
                        isLiked: newIsLiked
                    };
                }
                return artwork;
            }));

            // Update localStorage to persist user likes
            const savedLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
            const updatedArtwork = artworks.find(artwork => artwork.id === id);

            if (updatedArtwork) {
                if (!updatedArtwork.isLiked) {
                    // Add to likes if not already liked
                    localStorage.setItem('userLikes', JSON.stringify([...savedLikes, id]));
                } else {
                    // Remove from likes if already liked
                    localStorage.setItem('userLikes', JSON.stringify(savedLikes.filter((likeId: number | string) => likeId !== id)));
                }
            }
        }
    };

    const handleOpenArtwork = (artwork: Artwork) => {
        console.log("Opening artwork:", artwork);
        console.log("Harmonic parameters:", artwork.harmonic_parameters);

        // Create a properly formatted configuration object
        const params = artwork.harmonic_parameters || {};

        const config = {
            baseFrequency: params.base_frequency || 1.0,
            harmonicRatio: params.harmonic_ratio || 1.5,
            waveNumber: params.wave_number || 5,
            damping: params.damping || 0.02,
            amplitude: params.amplitude || 1.0,
            mode: (params.mode || "circular") as "circular" | "linear" | "radial",
            colorScheme: (params.color_scheme || "blue") as "blue" | "green" | "red" | "purple" | "rainbow",
            resolution: params.resolution || 512
        };

        console.log("Saving configuration:", config);

        // Save the configuration to localStorage
        localStorage.setItem("savedConfiguration", JSON.stringify(config));

        // Navigate to the artbuilder page
        router.push("/artbuilder");
    };

    return (
        <div className="container mx-auto px-4 py-24">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-mono text-terminal-gray terminal-heading">
                    &gt; Explore Creations
                </h1>
                <div className="flex gap-4">
                    <select className="terminal-input bg-white border border-terminal-blue-dark text-terminal-gray px-4 py-2 rounded">
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="trending">Trending</option>
                    </select>
                </div>
            </div>

            {/* Sign-in Prompt Modal */}
            {showSignInPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="terminal-card p-6 max-w-md w-full">
                        <h2 className="text-xl font-mono font-bold text-terminal-gray mb-4">Sign in to like artworks</h2>
                        <p className="text-terminal-gray mb-6">
                            Sign in to like artworks and save your preferences. Your like will be applied automatically after signing in.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="terminal-button"
                                onClick={handleClosePrompt}
                            >
                                Cancel
                            </button>
                            <SignInButton mode="modal">
                                <button className="terminal-button-green">
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-terminal-gray font-mono">Loading artworks...</p>
                </div>
            ) : (
                <>
                    {/* Grid of creations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {artworks.map((artwork) => (
                            <div
                                key={artwork.id}
                                className="group relative rounded overflow-hidden aspect-video terminal-card border border-terminal-blue-dark"
                            >
                                {/* Preview Image */}
                                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                    {artwork.imageUrl ? (
                                        <div className="w-full h-full relative">
                                            <img
                                                src={artwork.imageUrl}
                                                alt={artwork.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-terminal-gray font-mono">
                                            {typeof artwork.id === 'number' && artwork.id < 1000
                                                ? `Sample ${artwork.id + 1}`
                                                : 'User Creation'}
                                        </span>
                                    )}
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                                    <div>
                                        <h3 className="text-xl font-mono font-bold text-terminal-gray">
                                            {artwork.title || "Untitled Artwork"}
                                        </h3>
                                        <p className="text-terminal-gray/80 font-mono text-sm">
                                            by {artwork.creator || "Anonymous Artist"}
                                            {artwork.timestamp && (
                                                <span className="ml-2 text-xs opacity-70">
                                                    {new Date(artwork.timestamp).toLocaleDateString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <button
                                            className="terminal-button-green"
                                            onClick={() => handleOpenArtwork(artwork)}
                                        >
                                            Open
                                        </button>
                                        <button
                                            className={`p-2 rounded flex items-center gap-1 ${artwork.isLiked
                                                ? 'bg-terminal-pink text-white'
                                                : 'bg-terminal-blue/20 text-terminal-gray hover:bg-terminal-blue/40'
                                                } transition border border-terminal-blue-dark`}
                                            onClick={() => handleLike(artwork.id)}
                                            aria-label={artwork.isLiked ? "Unlike" : "Like"}
                                            title={isSignedIn ? (artwork.isLiked ? "Unlike" : "Like") : "Sign in to like"}
                                        >
                                            <span className="text-lg">{artwork.isLiked ? '♥' : '♡'}</span>
                                            <span>{artwork.likes}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="mt-12 flex justify-center">
                        <button className="terminal-button">
                            Load More
                        </button>
                    </div>
                </>
            )}
        </div>
    );
} 