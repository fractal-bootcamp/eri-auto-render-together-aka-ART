import { notFound } from "next/navigation";

const VALID_ROOM_TYPES = ["basic", "pro", "premium"];

export default function RoomPage({
    params,
}: {
    params: { type: string };
}) {
    if (!VALID_ROOM_TYPES.includes(params.type)) {
        notFound();
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* Main content area */}
            <div className="h-full flex flex-col md:flex-row">
                {/* Left sidebar - Code Editor */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black/60 backdrop-blur-lg border-r border-purple-500/20">
                    <div className="p-4 h-full">
                        <div className="h-full rounded-lg bg-black/40 p-4 border border-purple-500/20">
                            <textarea
                                className="w-full h-full bg-transparent text-purple-200 font-mono resize-none focus:outline-none"
                                placeholder="// Write your holographic art code here..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right side - Preview and Controls */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
                    {/* Preview area */}
                    <div className="flex-grow bg-black/40 p-4">
                        <div className="h-full rounded-lg bg-black/60 border border-purple-500/20 flex items-center justify-center">
                            <div className="text-purple-300/60">Preview will appear here</div>
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="h-32 bg-black/60 backdrop-blur-lg border-t border-purple-500/20 p-4">
                        <div className="flex flex-wrap gap-4">
                            <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition">
                                Run
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition">
                                Save
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition">
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat overlay */}
                <div className="fixed bottom-4 right-4 w-80 h-96 bg-black/80 backdrop-blur-xl rounded-lg border border-purple-500/20 shadow-2xl hidden md:block">
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-purple-200 font-bold">Room Chat</h3>
                            <button className="text-purple-400 hover:text-purple-200">
                                <span>×</span>
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto mb-4">
                            {/* Chat messages will go here */}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-grow px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 focus:outline-none focus:border-purple-500/40"
                                placeholder="Type a message..."
                            />
                            <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40">
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Music player overlay */}
                <div className="fixed top-4 right-4 w-80 bg-black/80 backdrop-blur-xl rounded-lg border border-purple-500/20 shadow-2xl p-4 hidden md:block">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-purple-200 font-bold">Music Player</h3>
                        <button className="text-purple-400 hover:text-purple-200">
                            <span>×</span>
                        </button>
                    </div>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 focus:outline-none focus:border-purple-500/40 mb-2"
                        placeholder="Paste YouTube URL..."
                    />
                    <div className="flex gap-2">
                        <button className="flex-grow px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40">
                            Play
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40">
                            Stop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 