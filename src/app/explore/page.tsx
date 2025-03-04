export default function ExplorePage() {
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

            {/* Grid of creations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* This will be populated with real data from the database */}
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className="group relative rounded overflow-hidden aspect-video terminal-card border border-terminal-blue-dark"
                    >
                        {/* Preview Image Placeholder */}
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <span className="text-terminal-gray font-mono">Preview {i + 1}</span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                            <div>
                                <h3 className="text-xl font-mono font-bold text-terminal-gray">Artwork Title</h3>
                                <p className="text-terminal-gray/80 font-mono text-sm">by Creator Name</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <button className="terminal-button-green">
                                    Open
                                </button>
                                <button className="p-2 rounded bg-terminal-blue/20 text-terminal-gray hover:bg-terminal-blue/40 transition border border-terminal-blue-dark">
                                    ♥ {Math.floor(Math.random() * 100)}
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
        </div>
    );
} 