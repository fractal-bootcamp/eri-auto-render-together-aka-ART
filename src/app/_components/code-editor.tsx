"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

export default function CodeEditor() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const timeRef = useRef(0)
    const [code, setCode] = useState(`speed=1.2
shape(99,.15,.5).color(0,1,2)

.diff( shape(240,5,0).scrollX(.05).rotate( ()=>time/10 ).color(1,0,.75))
.diff( shape(99,.4,.002).scrollX(.10).rotate( ()=>time/20 ).color(1,0,.75))
.diff( shape(99,.3,.002).scrollX(.15).rotate( ()=>time/30 ).color(1,0,.75))
.diff( shape(99,.2,.002).scrollX(.20).rotate( ()=>time/40 ).color(1,0,.75))
.diff( shape(99,.1,.002).scrollX(.25).rotate( ()=>time/50 ).color(1,0,.75))

.modulateScale(
  shape(240,5,0).scrollX(.05).rotate( ()=>time/10 )
, ()=>(Math.sin(time/3)*2)+2 )

.scale(1.6,.6,1)
.out()`)

    const animationRef = useRef<number | null>(null)

    // This is a simplified visualization - in a real implementation,
    // you would need to parse and execute the code to generate visuals
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        const animate = () => {
            // Use the ref for animation timing instead of state
            timeRef.current += 0.01
            const time = timeRef.current

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Create a gradient background
            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                canvas.width / 2,
            )
            gradient.addColorStop(0, "#001030")
            gradient.addColorStop(1, "#000010")
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw some animated shapes based on time
            // This is just a simple visualization, not actually parsing the code
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const maxRadius = Math.min(canvas.width, canvas.height) * 0.4

            // Draw multiple overlapping circles with different colors
            for (let i = 0; i < 5; i++) {
                const hue = (time * 20 + i * 60) % 360
                const radius = maxRadius * (0.6 + 0.4 * Math.sin(time + i))
                const x = centerX + Math.cos(time * (i + 1) * 0.2) * radius * 0.2
                const y = centerY + Math.sin(time * (i + 1) * 0.2) * radius * 0.2

                ctx.beginPath()
                ctx.arc(x, y, radius, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`
                ctx.fill()
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, []) // Remove time from dependencies

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Execute code with Ctrl+Shift+Enter
        if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
            console.log("Executing code:", code)
            // In a real implementation, this would parse and execute the code
        }
    }

    return (
        <div className="flex h-[calc(100vh-40px)]">
            {/* Code editor */}
            <div className="w-1/2 h-full bg-black p-4">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-black text-green-400 font-mono p-2 resize-none focus:outline-none"
                    spellCheck="false"
                />
            </div>

            {/* Visual output */}
            <div className="w-1/2 h-full">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        </div>
    )
}

