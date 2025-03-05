"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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
    imageUrl?: string
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
    const [configLoaded, setConfigLoaded] = useState(false)

    // Load saved configuration if available
    useEffect(() => {
        // First check if there's a complete configuration in localStorage
        const savedCompleteArtwork = localStorage.getItem('selectedArtworkComplete')

        if (savedCompleteArtwork) {
            try {
                const parsedCompleteConfig = JSON.parse(savedCompleteArtwork)
                console.log("Artbuilder found complete saved configuration:", parsedCompleteConfig)

                // Extract the harmonic parameters from the complete config
                if (parsedCompleteConfig.harmonic_parameters) {
                    const params = parsedCompleteConfig.harmonic_parameters

                    // Create a properly formatted configuration object
                    const validatedConfig = {
                        baseFrequency: params.base_frequency ?? initialConfig.baseFrequency,
                        harmonicRatio: params.harmonic_ratio ?? initialConfig.harmonicRatio,
                        waveNumber: params.wave_number ?? initialConfig.waveNumber,
                        damping: params.damping ?? initialConfig.damping,
                        amplitude: params.amplitude ?? initialConfig.amplitude,
                        mode: (params.mode ?? initialConfig.mode) as "circular" | "rectangular" | "triangular",
                        colorScheme: (params.color_scheme ?? initialConfig.colorScheme) as "blue" | "rainbow" | "monochrome",
                        resolution: params.resolution ?? initialConfig.resolution,
                        shaderCode: parsedCompleteConfig.shader_code
                    }

                    // Apply the validated configuration
                    console.log("Applying complete configuration to state:", validatedConfig)
                    setHarmonistConfig(validatedConfig)
                    setConfigLoaded(true)
                    console.log("Complete configuration loaded and applied")

                    // Keep the complete config in localStorage for the ConfigPanel to use
                } else {
                    console.warn("Complete configuration is missing harmonic_parameters")
                    setConfigLoaded(true)
                }
            } catch (error) {
                console.error("Error loading complete saved artwork:", error)
                setConfigLoaded(true)

                // Fall back to the simple configuration
                checkSimpleConfig()
            }
        } else {
            // Fall back to the simple configuration
            checkSimpleConfig()
        }

        function checkSimpleConfig() {
            // Check if there's a selected artwork in localStorage
            const savedArtwork = localStorage.getItem('selectedArtwork')
            if (savedArtwork) {
                try {
                    const parsedConfig = JSON.parse(savedArtwork)
                    console.log("Artbuilder found simple saved configuration:", parsedConfig)

                    // Ensure all required properties have default values if they're missing
                    const validatedConfig = {
                        baseFrequency: parsedConfig.baseFrequency ?? initialConfig.baseFrequency,
                        harmonicRatio: parsedConfig.harmonicRatio ?? initialConfig.harmonicRatio,
                        waveNumber: parsedConfig.waveNumber ?? initialConfig.waveNumber,
                        damping: parsedConfig.damping ?? initialConfig.damping,
                        amplitude: parsedConfig.amplitude ?? initialConfig.amplitude,
                        mode: (parsedConfig.mode ?? initialConfig.mode) as "circular" | "rectangular" | "triangular",
                        colorScheme: (parsedConfig.colorScheme ?? initialConfig.colorScheme) as "blue" | "rainbow" | "monochrome",
                        resolution: parsedConfig.resolution ?? initialConfig.resolution,
                        shaderCode: parsedConfig.shaderCode
                    }

                    // Apply the validated configuration
                    console.log("Applying simple validated configuration to state:", validatedConfig)
                    setHarmonistConfig(validatedConfig)
                    setConfigLoaded(true)
                    console.log("Simple configuration loaded and applied")

                    // Clear the selected artwork from localStorage to prevent reloading on refresh
                    localStorage.removeItem('selectedArtwork')
                } catch (error) {
                    console.error("Error loading simple saved artwork:", error)
                    setConfigLoaded(true)
                }
            } else {
                console.log("No saved configuration found, using default")
                setConfigLoaded(true)
            }
        }
    }, [initialConfig])

    // Use useCallback to memoize the handler function
    const handleConfigChange = useCallback((config: HarmonistConfig) => {
        setHarmonistConfig(config)
    }, [])

    // Don't render until we've checked for saved configuration
    if (!configLoaded) {
        return (
            <main className="min-h-screen bg-[#f5f0e6] flex flex-col items-center justify-center">
                <div className="text-terminal-gray font-mono">Loading configuration...</div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#f5f0e6] flex flex-col">
            <TerminalHeader />
            <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
                <div className="w-full md:w-2/3 h-[70vh] md:h-auto flex items-center justify-center">
                    <ArtCanvas config={harmonistConfig} />
                </div>
                <div className="w-full md:w-1/3 bg-[#f5f0e6] border border-gray-300 rounded-md">
                    <ConfigPanel onConfigChange={handleConfigChange} initialConfig={harmonistConfig} />
                </div>
            </div>
        </main>
    )
}

