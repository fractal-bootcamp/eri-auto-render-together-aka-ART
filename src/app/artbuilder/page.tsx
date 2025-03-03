import Link from "next/link";

const ROOM_TYPES = [
    {
        name: "Basic Studio",
        description: "Perfect for solo creation and experimentation",
        type: "BASIC",
        features: ["Real-time code editing", "Basic effects", "Personal workspace"],
    },
    {
        name: "Pro Collaboration",
        description: "Create and collaborate with friends",
        type: "PRO",
        features: ["Multiple participants", "Chat system", "Shared workspace", "Music integration"],
    },
    {
        name: "Premium Experience",
        description: "Ultimate creative environment",
        type: "PREMIUM",
        features: ["Advanced effects", "Multiple view modes", "Recording capabilities", "Premium assets"],
    },
];

export default function ArtBuilderPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-transparent bg-clip-text">
                Choose Your Creative Space
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ROOM_TYPES.map((room) => (
                    <div
                        key={room.type}
                        className="relative group"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative p-6 bg-black/40 backdrop-blur-xl rounded-lg border border-purple-500/20 h-full flex flex-col">
                            <h3 className="text-2xl font-bold text-purple-200 mb-2">{room.name}</h3>
                            <p className="text-purple-300/80 mb-4">{room.description}</p>
                            <ul className="space-y-2 mb-8 flex-grow">
                                {room.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-purple-200/60">
                                        <span className="mr-2">•</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`/artbuilder/${room.type.toLowerCase()}`}
                                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
                            >
                                <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-black/50 rounded-md group-hover:bg-opacity-0 text-center">
                                    Enter Room
                                </span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 