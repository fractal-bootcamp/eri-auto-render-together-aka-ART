export default function ExplorePage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-transparent bg-clip-text">
                    Explore Creations
                </h1>
                <div className="flex gap-4">
                    <select className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-lg border border-purple-500/20 text-purple-200 focus:outline-none">
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="trending">Trending</option>
                    </select>
                </div>
            </div>

            {/* Grid of creations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* This will be populated with real data from the database */}
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className="group relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                    >
                        {/* Preview Image Placeholder */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-purple-300/60">Preview</span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                            <div>
                                <h3 className="text-xl font-bold text-purple-200">Artwork Title</h3>
                                <p className="text-purple-300/80 text-sm">by Creator Name</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition">
                                    Open
                                </button>
                                <button className="p-2 rounded-full bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition">
                                    ♥ {Math.floor(Math.random() * 100)}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="mt-12 flex justify-center">
                <button className="px-6 py-3 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/40 transition">
                    Load More
                </button>
            </div>
        </div>
    );
} 