export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black/90">
            <div className="max-w-md w-full space-y-8 p-8 bg-black/80 backdrop-blur-lg rounded-xl border border-purple-500/50 shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-transparent bg-clip-text">
                        Welcome to Auto-Render-Together
                    </h2>
                    <p className="mt-2 text-center text-sm text-purple-100">
                        Create and share holographic art in real-time
                    </p>
                </div>
                <div className="mt-8">
                    <div className="space-y-4">
                        {/* Clerk will be integrated here */}
                        <div className="flex justify-center">
                            <button
                                className="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
                            >
                                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-black rounded-md group-hover:bg-opacity-0">
                                    Sign in with Clerk (Coming Soon)
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 