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
        <div className="container mx-auto px-4 py-24">
            <h1 className="text-3xl font-mono text-terminal-gray text-center mb-12 terminal-heading">
                &gt; Choose Your Creative Space
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ROOM_TYPES.map((room, index) => (
                    <div
                        key={room.type}
                        className="relative"
                    >
                        <div className={`p-6 bg-white rounded terminal-card border ${index === 0 ? 'border-terminal-blue-dark' : index === 1 ? 'border-terminal-lime' : 'border-terminal-blue'} h-full flex flex-col`}>
                            <h3 className="text-2xl font-mono font-bold text-terminal-gray mb-2">{room.name}</h3>
                            <p className="text-terminal-gray/80 mb-4 font-mono">{room.description}</p>
                            <ul className="space-y-2 mb-8 flex-grow">
                                {room.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-terminal-gray/80 font-mono">
                                        <span className="mr-2 text-terminal-blue-dark">›</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`/artbuilder/${room.type.toLowerCase()}`}
                                className={`terminal-button${index === 1 ? '-green' : ''} text-center`}
                            >
                                Enter Room
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 