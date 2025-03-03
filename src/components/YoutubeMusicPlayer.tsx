"use client";

import { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import type { YouTubePlayer, YouTubeEvent } from "react-youtube";

interface Track {
    id: string;
    title: string;
    artist: string;
}

interface YoutubeMusicPlayerProps {
    initialPlaylist?: Track[];
    autoplay?: boolean;
}

export default function YoutubeMusicPlayer({ initialPlaylist = [], autoplay = false }: YoutubeMusicPlayerProps) {
    const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(80);
    const [youtubeLink, setYoutubeLink] = useState("");
    const [customTitle, setCustomTitle] = useState("");
    const [customArtist, setCustomArtist] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const playerRef = useRef<YouTubePlayer | null>(null);

    const currentTrack = playlist.length > 0 ? playlist[currentTrackIndex] : null;

    const opts = {
        height: '150',
        width: '100%',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: autoplay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
        },
    };

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        playerRef.current.setVolume(volume);
        if (isMuted) {
            playerRef.current.mute();
        }
    };

    const onEnd = () => {
        // Remove the current track from the playlist
        setPlaylist(prev => {
            const newPlaylist = [...prev];
            newPlaylist.splice(currentTrackIndex, 1);
            return newPlaylist;
        });

        // If we removed the last track in the playlist, don't change the index
        // Otherwise, the index stays the same to play the next track (which moved up)
        if (currentTrackIndex >= playlist.length - 1) {
            setCurrentTrackIndex(Math.max(0, playlist.length - 2));
        }
    };

    const playNextTrack = () => {
        if (playlist.length <= 1) return;

        // Remove the current track
        setPlaylist(prev => {
            const newPlaylist = [...prev];
            newPlaylist.splice(currentTrackIndex, 1);
            return newPlaylist;
        });

        // If we're at the end of the playlist, go back to the first track
        if (currentTrackIndex >= playlist.length - 1) {
            setCurrentTrackIndex(0);
        }
        // Otherwise index stays the same to play the next track (which moved up)
    };

    const playPrevTrack = () => {
        if (playlist.length <= 1) return;

        const newIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        setCurrentTrackIndex(newIndex);
    };

    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.unMute();
            } else {
                playerRef.current.mute();
            }
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
        }
    };

    // Extract YouTube ID from various YouTube URL formats
    const extractYoutubeId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2]?.length === 11) ? match[2] : null;
    };

    const handleImportLink = (e: React.FormEvent) => {
        e.preventDefault();

        const videoId = extractYoutubeId(youtubeLink);
        if (!videoId) {
            alert("Invalid YouTube URL. Please enter a valid YouTube video link.");
            return;
        }

        // Add the new track to the playlist
        const newTrack: Track = {
            id: videoId,
            title: customTitle || "Imported Track",
            artist: customArtist || "Unknown Artist"
        };

        setPlaylist(prev => [...prev, newTrack]);

        // If this is the first track, set it as current
        if (playlist.length === 0) {
            setCurrentTrackIndex(0);
        }

        // Clear the form
        setYoutubeLink("");
        setCustomTitle("");
        setCustomArtist("");
        setIsImporting(false);
    };

    // Reset player when track changes
    useEffect(() => {
        if (playerRef.current && isPlaying) {
            playerRef.current.playVideo();
        }
    }, [currentTrackIndex]);

    if (playlist.length === 0) {
        return (
            <div className="text-purple-200 font-cyber p-4 border border-purple-500/20 rounded-lg bg-black/40">
                <h3 className="text-center mb-4">Add Music to Your Playlist</h3>
                <form onSubmit={handleImportLink} className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">YouTube URL</label>
                        <input
                            type="text"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-purple-500/70"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Track Title (optional)</label>
                        <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="Enter track title"
                            className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-purple-500/70"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Artist (optional)</label>
                        <input
                            type="text"
                            value={customArtist}
                            onChange={(e) => setCustomArtist(e.target.value)}
                            placeholder="Enter artist name"
                            className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-purple-500/70"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg transition"
                    >
                        Add to Playlist
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="text-purple-200 font-cyber">
            <div className="mb-3 text-center">
                <div className="font-bold text-purple-200">{currentTrack?.title}</div>
                <div className="text-sm text-purple-400">{currentTrack?.artist}</div>
            </div>

            <div className="relative rounded-lg overflow-hidden mb-3 border border-purple-500/20">
                {currentTrack && (
                    <YouTube
                        videoId={currentTrack.id}
                        opts={opts}
                        onReady={onReady}
                        onEnd={onEnd}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="w-full"
                    />
                )}
                {/* Overlay for custom controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            </div>

            {/* Volume control */}
            <div className="flex items-center mb-3 space-x-2">
                <button
                    onClick={toggleMute}
                    className="text-purple-300 hover:text-purple-100"
                >
                    {isMuted ? "🔇" : "🔊"}
                </button>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-purple-500/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            {/* Playback controls */}
            <div className="flex justify-between items-center mb-3">
                <button
                    onClick={playPrevTrack}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition"
                    disabled={playlist.length <= 1}
                >
                    ⏮️ Prev
                </button>

                <button
                    onClick={togglePlay}
                    className="px-6 py-1 rounded-lg bg-purple-500/30 text-purple-100 hover:bg-purple-500/50 transition"
                >
                    {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                </button>

                <button
                    onClick={playNextTrack}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition"
                    disabled={playlist.length <= 1}
                >
                    Next ⏭️
                </button>
            </div>

            {/* Playlist management */}
            <div className="flex justify-between items-center">
                <div className="text-xs text-purple-400">
                    {playlist.length} track{playlist.length !== 1 ? 's' : ''} in playlist
                </div>

                <button
                    onClick={() => setIsImporting(!isImporting)}
                    className="px-3 py-1 text-sm rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition"
                >
                    {isImporting ? "Cancel" : "Add Track"}
                </button>
            </div>

            {/* Import form */}
            {isImporting && (
                <div className="mt-3 p-3 border border-purple-500/20 rounded-lg bg-black/40">
                    <form onSubmit={handleImportLink} className="space-y-2">
                        <div>
                            <input
                                type="text"
                                value={youtubeLink}
                                onChange={(e) => setYoutubeLink(e.target.value)}
                                placeholder="Paste YouTube URL"
                                className="w-full px-3 py-1 text-sm bg-black/60 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-purple-500/70"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="Title (optional)"
                                className="flex-1 px-3 py-1 text-sm bg-black/60 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-purple-500/70"
                            />
                            <input
                                type="text"
                                value={customArtist}
                                onChange={(e) => setCustomArtist(e.target.value)}
                                placeholder="Artist (optional)"
                                className="flex-1 px-3 py-1 text-sm bg-black/60 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-purple-500/70"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-1 text-sm bg-purple-500/30 hover:bg-purple-500/50 rounded-lg transition"
                        >
                            Add to Playlist
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
} 