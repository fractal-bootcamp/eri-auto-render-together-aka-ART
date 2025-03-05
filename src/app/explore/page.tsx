"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";

interface Artwork {
    id: number | string;
    title: string;
    creator: string;
    likes: number;
    isLiked: boolean;
    imageUrl?: string;
    timestamp?: number;
    harmonic_parameters?: {
        base_frequency: number;
        harmonic_ratio: number;
        wave_number: number;
        damping: number;
        amplitude: number;
        mode: string;
        color_scheme: string;
        resolution: number;
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
        const dbArtworksFormatted: Artwork[] = dbArtworks
            ? dbArtworks.map(dbArt => {
                // Parse the code to get harmonic parameters
                let harmonic_parameters;
                try {
                    const parsedCode = JSON.parse(dbArt.code);
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
                } catch (error) {
                    console.error("Error parsing artwork code:", error);
                }

                return {
                    id: dbArt.id,
                    title: dbArt.name,
                    creator: dbArt.user?.name || "Unknown Artist",
                    likes: dbArt._count?.likes || 0,
                    isLiked: likedArtworkIds.includes(dbArt.id),
                    imageUrl: dbArt.thumbnail || undefined,
                    timestamp: dbArt.createdAt.getTime(),
                    harmonic_parameters
                };
            })
            : [];

        // Combine all artworks, prioritizing DB artworks
        const combinedArtworks = [...dbArtworksFormatted, ...localArtworks, ...sampleArtworks];

        setArtworks(combinedArtworks);
        setIsLoading(false);
    }, [dbArtworks]);

    const handleLike = (id: string | number) => {
        // If the user is signed in and the artwork is from the database (string ID)
        if (isSignedIn && typeof id === 'string') {
            // Use the tRPC mutation to toggle like
            toggleLikeMutation.mutate({ configId: id });
        } else {
            // For local artworks or when user is not signed in
            // Update artworks state
            setArtworks(artworks.map(artwork => {
                if (artwork.id === id) {
                    return {
                        ...artwork,
                        likes: artwork.isLiked ? artwork.likes - 1 : artwork.likes + 1,
                        isLiked: !artwork.isLiked
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
        if (artwork.harmonic_parameters) {
            // Save the configuration to localStorage for the artbuilder to load
            localStorage.setItem('selectedArtwork', JSON.stringify({
                baseFrequency: artwork.harmonic_parameters.base_frequency,
                harmonicRatio: artwork.harmonic_parameters.harmonic_ratio,
                waveNumber: artwork.harmonic_parameters.wave_number,
                damping: artwork.harmonic_parameters.damping,
                amplitude: artwork.harmonic_parameters.amplitude,
                mode: artwork.harmonic_parameters.mode,
                colorScheme: artwork.harmonic_parameters.color_scheme,
                resolution: artwork.harmonic_parameters.resolution
            }));

            // Navigate to the artbuilder page
            router.push('/artbuilder');
        } else {
            alert('This artwork cannot be opened for editing.');
        }
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
                                            by {artwork.creator || "Unknown Artist"}
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
                                            className={`p-2 rounded ${artwork.isLiked ? 'bg-terminal-pink' : 'bg-terminal-blue/20'} text-terminal-gray hover:bg-terminal-blue/40 transition border border-terminal-blue-dark`}
                                            onClick={() => handleLike(artwork.id)}
                                            aria-label={artwork.isLiked ? "Unlike" : "Like"}
                                        >
                                            {artwork.isLiked ? '♥' : '♡'} {artwork.likes}
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