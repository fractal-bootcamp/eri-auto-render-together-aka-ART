"use client"

import { useState, useCallback, useRef } from "react"
import ArtCanvas from "@/app/_components/art-canvas"
import ConfigPanel from "@/app/_components/config-panel"
import TerminalHeader from "@/app/_components/terminal-header"

// Define the HarmonistConfig type for better type safety
interface HarmonistConfig {
    baseFrequency: number
    harmonicRatio: number
    waveNumber: number
    damping: number
    amplitude: number
    mode: "circular" | "rectangular" | "triangular"
    colorScheme: "blue" | "rainbow" | "monochrome"
    resolution: number
    shaderCode?: {
        fragmentShader: string
        vertexShader: string
    }
}

export default function Home() {
    // Use useRef for the initial config to avoid re-renders
    const initialConfig = useRef<HarmonistConfig>({
        baseFrequency: 432,
        harmonicRatio: 1.618,
        waveNumber: 8,
        damping: 0.02,
        amplitude: 0.8,
        mode: "circular",
        colorScheme: "blue",
        resolution: 256,
        shaderCode: undefined,
    }).current

    const [harmonistConfig, setHarmonistConfig] = useState<HarmonistConfig>(initialConfig)

    // Use useCallback to memoize the handler function
    const handleConfigChange = useCallback((config: HarmonistConfig) => {
        setHarmonistConfig(config)
    }, [])

    return (
        <main className="min-h-screen bg-[#f5f0e6] flex flex-col">
            <TerminalHeader />
            <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
                <div className="w-full md:w-2/3 h-[70vh] md:h-auto flex items-center justify-center">
                    <ArtCanvas config={harmonistConfig} />
                </div>
                <div className="w-full md:w-1/3 bg-[#f5f0e6] border border-gray-300 rounded-md">
                    <ConfigPanel onConfigChange={handleConfigChange} initialConfig={initialConfig} />
                </div>
            </div>
        </main>
    )
}

