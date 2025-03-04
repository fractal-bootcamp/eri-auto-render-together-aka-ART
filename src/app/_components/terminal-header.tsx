"use client"

import { useState } from "react"
import { Terminal, Maximize2, Minimize2, X, HelpCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TerminalHeader() {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true)
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false)
                }
            }
        } catch (err) {
            console.error(`Error attempting to toggle fullscreen: ${(err as Error).message}`)
        }
    }

    return (
        <header className="bg-[#1a1a1a] text-white p-2 flex items-center justify-between">
            <div className="flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                <h1 className="text-sm font-mono">Arithmetic Resonance Toolkit (ART)</h1>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700">
                    <HelpCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700">
                    <Settings className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </header>
    )
}

