"use client"

import { X, Maximize, Minimize } from "lucide-react"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { AuthButtons } from "./AuthButtons"

interface LandingPageProps {
    onCloseWindow: () => void
}

export default function LandingPage({ onCloseWindow }: LandingPageProps) {
    return (
        <div className="relative z-10 w-[800px] max-w-[95vw] bg-black border border-gray-700 rounded-md shadow-2xl">
            {/* Window controls */}
            <div className="flex justify-between items-center px-4 py-2 bg-black border-b border-gray-700">
                <div></div>
                <div className="flex space-x-4">
                    <button className="text-white hover:text-gray-300">
                        <Minimize size={16} />
                    </button>
                    <button className="text-white hover:text-gray-300">
                        <Maximize size={16} />
                    </button>
                    <button className="text-white hover:text-gray-300" onClick={onCloseWindow}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 bg-black text-white">
                <div className="mb-8">
                    <h1 className="text-5xl font-bold mb-2">ART: Artistic Reality Terminal</h1>
                    <h2 className="text-xl tracking-wider">auto-render-together with assigned role templates</h2>
                </div>

                <div className="my-6 border-t border-b border-gray-700 py-2">{Array(30).fill("//").join("")}</div>

                <div className="mb-8">
                    <p className="mb-4">
                        Artistic Reality Terminal (ART) introduces a revolutionary approach to creative collaboration through advanced holographic projection technology. The platform transforms standard physical spaces into dynamic creation environments where remotely connected users can interact with volumetric representations of digital content.
                        {"\n\n"}
                        Within the holographic workspace, collaborators appear as customizable avatars with realistic hand movements captured through haptic gloves. Each participant can manipulate shared three-dimensional objects floating in the air between them&mdash;stretching textures across virtual canvases, sculpting light with gesture-based tools, or programming reactive behaviors through intuitive visual interfaces.
                        {"\n\n"}
                        The system&apos;s proprietary Spatial Persistence technology ensures that holographic elements maintain consistent positions within real environments, allowing creations to seamlessly blend with physical spaces. Artists can step away and return hours later to find their collaborative works exactly where they left them, gently rotating and responsive to environmental changes.
                        {"\n\n"}
                        Most remarkably, ART&apos;s Volumetric Memory feature records the entire creative process as a time-navigable sculptural timeline, enabling collaborators to scrub backward through the creation&apos;s history&mdash;branching alternate versions or retrieving elements from earlier iterations. Conversations between participants are spatially anchored to relevant parts of the creation, allowing future visitors to experience not just the final piece, but the complete narrative of its evolution.
                        {"\n\n"}
                        The platform&apos;s Neural Interpretation algorithms translate between different artistic vocabularies and working styles, helping bridge communication gaps between collaborators from diverse backgrounds. A visual programmer and abstract painter can work together fluidly despite their different approaches, as the system helps translate intentions into forms understandable by both.
                        {"\n\n"}
                        Beyond artistic applications, ART&apos;s holographic collaboration environment is revolutionizing fields from architecture to molecular biology, anywhere the ability to collectively manipulate and visualize three-dimensional information can drive innovation through shared spatial understanding.
                    </p>

                    <SignedOut>
                        <div className="flex justify-center mt-8">
                            <AuthButtons />
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div>
                            <p className="mb-4">To get started:</p>
                            <ol className="list-decimal pl-8 space-y-2">
                                <li>Close this window</li>
                                <li>Change some numbers</li>
                                <li>Type Ctrl + Shift + Enter</li>
                            </ol>
                        </div>
                    </SignedIn>
                </div>

                <div className="mt-6 border-t border-b border-gray-700 py-2">{Array(30).fill("//").join("")}</div>
            </div>
        </div>
    );
}

