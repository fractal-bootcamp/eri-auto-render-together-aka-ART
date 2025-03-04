"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Camera, Trash2, Download, Palette, Zap, Hand, Sparkles, X, Bug } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// Import MediaPipe dependencies
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision"

// Types for our drawing points
interface Point {
    x: number
    y: number
    size: number
    color: string
    timestamp: number
}

interface Line {
    points: Point[]
    color: string
}

export default function HolographicEditor() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
    const [handLandmarker, setHandLandmarker] = useState<any>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lines, setLines] = useState<Line[]>([])
    const [currentLine, setCurrentLine] = useState<Point[]>([])
    const [color, setColor] = useState("#00ffff")
    const [brushSize, setBrushSize] = useState(15)
    const [showControls, setShowControls] = useState(true)
    const [showCamera, setShowCamera] = useState(true)
    const [handDetected, setHandDetected] = useState(false)
    const [trackingStatus, setTrackingStatus] = useState<"initializing" | "ready" | "error" | "detecting">("initializing")
    const [fps, setFps] = useState(0)
    const lastFrameTime = useRef(performance.now())
    const frameCount = useRef(0)
    const [currentHandLandmarks, setCurrentHandLandmarks] = useState<any[]>([])
    const [pointerPosition, setPointerPosition] = useState<{ x: number, y: number } | null>(null)

    const colors = [
        "#00ffff", // cyan
        "#ff00ff", // magenta
        "#ffff00", // yellow
        "#00ff00", // green
        "#ff0000", // red
        "#0000ff", // blue
        "#ffffff", // white
    ]

    // Initialize the hand landmarker
    useEffect(() => {
        const initializeHandLandmarker = async () => {
            try {
                setTrackingStatus("initializing")
                console.log("Initializing hand tracking...")

                // Load the MediaPipe libraries dynamically
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                )

                const handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    numHands: 1,
                    runningMode: "VIDEO" // For debugging you might try "IMAGE"
                })

                setHandLandmarker(handLandmarkerInstance)
                setTrackingStatus("ready")
                console.log("HandLandmarker Loaded:", handLandmarkerInstance)
            } catch (error) {
                console.error("Error initializing hand tracking:", error)
                setTrackingStatus("error")
            }
        }

        initializeHandLandmarker()
    }, [])

    // Start the camera
    const startCamera = async () => {
        if (!videoRef.current) return

        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            videoRef.current.srcObject = stream

            // Wait for the video feed to be loaded before starting detection
            videoRef.current.onloadeddata = () => {
                console.log("Camera feed loaded, starting hand detection...")
                detectHands()
            }

            await videoRef.current.play()
            setCameraActive(true)
        } catch (error) {
            console.error("Error accessing camera:", error)
            setTrackingStatus("error")
        }
    }

    // Stop the camera
    const stopCamera = () => {
        if (!videoRef.current || !videoRef.current.srcObject) return

        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
        videoRef.current.srcObject = null
        setCameraActive(false)
    }

    // Detect hands and track index finger (async)
    const detectHands = async () => {
        if (!handLandmarker || !videoRef.current || !canvasRef.current || !overlayCanvasRef.current) {
            console.warn("Hand detection loop stopped due to missing references.")
            return
        }

        const video = videoRef.current
        const canvas = canvasRef.current
        const overlayCanvas = overlayCanvasRef.current
        const ctx = canvas.getContext("2d")
        const overlayCtx = overlayCanvas.getContext("2d")

        if (!ctx || !overlayCtx) {
            console.warn("Canvas contexts not available.")
            return
        }

        // Set canvas dimensions to match video
        if (video.videoWidth && video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            overlayCanvas.width = video.videoWidth
            overlayCanvas.height = video.videoHeight
        }

        // Only run detection if video is playing
        if (video.readyState === 4 && cameraActive) {
            // Calculate FPS
            frameCount.current += 1
            const now = performance.now()
            const elapsed = now - lastFrameTime.current

            if (elapsed > 1000) {
                setFps(frameCount.current / (elapsed / 1000))
                frameCount.current = 0
                lastFrameTime.current = now
            }

            setTrackingStatus("detecting")
            const startTimeMs = performance.now()
            const results = await handLandmarker.detectForVideo(video, startTimeMs)
            console.log("Detection Results:", results)

            // Clear overlay canvas for hand landmarks
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

            // Update hand detection status
            const handsDetected = results.landmarks && results.landmarks.length > 0
            setHandDetected(handsDetected)

            if (handsDetected) {
                const landmarks = results.landmarks[0]
                // Store landmarks for debug view
                setCurrentHandLandmarks(landmarks)

                // Draw hand landmarks for debugging if camera overlay is enabled
                if (showCamera) {
                    drawConnectors(
                        overlayCtx,
                        landmarks,
                        [
                            [0, 1],
                            [1, 2],
                            [2, 3],
                            [3, 4], // thumb
                            [0, 5],
                            [5, 6],
                            [6, 7],
                            [7, 8], // index finger
                            [0, 9],
                            [9, 10],
                            [10, 11],
                            [11, 12], // middle finger
                            [0, 13],
                            [13, 14],
                            [14, 15],
                            [15, 16], // ring finger
                            [0, 17],
                            [17, 18],
                            [18, 19],
                            [19, 20], // pinky
                            [0, 5],
                            [5, 9],
                            [9, 13],
                            [13, 17], // palm
                        ],
                        { color: "rgba(255, 255, 255, 0.5)", lineWidth: 2 },
                    )

                    for (let i = 0; i < landmarks.length; i++) {
                        const landmark = landmarks[i]
                        overlayCtx.fillStyle = "rgba(255, 255, 255, 0.7)"
                        overlayCtx.beginPath()
                        overlayCtx.arc(landmark.x * overlayCanvas.width, landmark.y * overlayCanvas.height, 3, 0, 2 * Math.PI)
                        overlayCtx.fill()
                    }
                }

                // Track index finger tip (landmark 8)
                const indexTip = landmarks[8]
                const indexX = indexTip.x * canvas.width
                const indexY = indexTip.y * canvas.height

                // Highlight the index finger tip
                overlayCtx.fillStyle = color
                overlayCtx.beginPath()
                overlayCtx.arc(indexX, indexY, brushSize / 2, 0, 2 * Math.PI)
                overlayCtx.fill()

                setPointerPosition({ x: indexX, y: indexY })

                // Check if index finger is extended (comparing with middle knuckle)
                const indexMCP = landmarks[5]
                const indexPIP = landmarks[6]
                const indexDIP = landmarks[7]

                const isExtended = indexTip.z < indexDIP.z && indexDIP.z < indexPIP.z && indexPIP.z < indexMCP.z

                if (isExtended && !isDrawing) {
                    // Start a new line when finger extends
                    setCurrentLine([])
                    setIsDrawing(true)
                } else if (isExtended && isDrawing) {
                    // Continue the line while finger is extended
                    const point = {
                        x: indexX,
                        y: indexY,
                        size: brushSize,
                        color: color,
                        timestamp: Date.now(),
                    }
                    setCurrentLine((prev) => [...prev, point])
                } else if (!isExtended && isDrawing) {
                    // End the line when finger retracts
                    if (currentLine.length > 0) {
                        setLines((prev) => [...prev, { points: currentLine, color }])
                        setCurrentLine([])
                    }
                    setIsDrawing(false)
                }
            } else {
                setPointerPosition(null)
            }
        }

        // Draw current line on the drawing canvas
        if (currentLine.length > 0) {
            drawHolographicLine(ctx, currentLine, color)
        }

        // Continue the detection loop
        requestAnimationFrame(detectHands)
    }

    // Calculate distance between two points (utility)
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    // Draw connectors between landmarks
    const drawConnectors = (
        ctx: CanvasRenderingContext2D,
        landmarks: any[],
        connections: number[][],
        style: { color: string; lineWidth: number },
    ) => {
        ctx.strokeStyle = style.color
        ctx.lineWidth = style.lineWidth

        for (const connection of connections) {
            const [start, end] = connection
            if (
                start !== undefined &&
                end !== undefined &&
                landmarks[start] &&
                landmarks[end] &&
                landmarks[start].x !== undefined &&
                landmarks[start].y !== undefined &&
                landmarks[end].x !== undefined &&
                landmarks[end].y !== undefined
            ) {
                ctx.beginPath()
                ctx.moveTo(landmarks[start].x * ctx.canvas.width, landmarks[start].y * ctx.canvas.height)
                ctx.lineTo(landmarks[end].x * ctx.canvas.width, landmarks[end].y * ctx.canvas.height)
                ctx.stroke()
            }
        }
    }

    // Draw holographic line with glow effect
    const drawHolographicLine = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
        if (!points.length) return

        // Set up the line style
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        // Add glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = color

        ctx.beginPath()
        if (points[0]) {
            ctx.moveTo(points[0].x, points[0].y)
        }

        for (let i = 1; i < points.length; i++) {
            const point = points[i]
            const prevPoint = points[i - 1]

            if (point && prevPoint) {
                // Create smooth curves between points
                const midX = (prevPoint.x + point.x) / 2
                const midY = (prevPoint.y + point.y) / 2

                ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
            }
        }

        if (points.length > 1) {
            const lastPoint = points[points.length - 1]
            if (lastPoint) {
                ctx.lineTo(lastPoint.x, lastPoint.y)
            }
        }

        ctx.stroke()

        // Add sparkles along the line for a holographic effect
        ctx.shadowBlur = 0

        for (let i = 0; i < points.length; i += 3) {
            const point = points[i]
            if (point) {
                drawSparkle(ctx, point.x, point.y, color)
            }
        }
    }

    // Draw sparkle effect
    const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
        const size = Math.random() * 4 + 2

        ctx.save()
        ctx.fillStyle = color
        ctx.globalAlpha = Math.random() * 0.7 + 0.3

        // Draw a small star
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5
            const outerX = x + size * Math.cos(angle)
            const outerY = y + size * Math.sin(angle)

            if (i === 0) {
                ctx.moveTo(outerX, outerY)
            } else {
                ctx.lineTo(outerX, outerY)
            }

            const innerAngle = angle + Math.PI / 5
            const innerX = x + (size / 2) * Math.cos(innerAngle)
            const innerY = y + (size / 2) * Math.sin(innerAngle)
            ctx.lineTo(innerX, innerY)
        }

        ctx.closePath()
        ctx.fill()
        ctx.restore()
    }

    // Render all lines on the drawing canvas
    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw all completed lines
        lines.forEach((line) => {
            drawHolographicLine(ctx, line.points, line.color)
        })

        // Draw current line
        if (currentLine.length > 0) {
            drawHolographicLine(ctx, currentLine, color)
        }
    }, [lines, currentLine, color])

    // Clear canvas
    const clearCanvas = () => {
        setLines([])
        setCurrentLine([])
    }

    // Download canvas as image
    const downloadCanvas = () => {
        if (!canvasRef.current) return

        const link = document.createElement("a")
        link.download = "holographic-drawing.png"
        link.href = canvasRef.current.toDataURL("image/png")
        link.click()
    }

    // Toggle camera visibility
    const toggleCamera = () => {
        setShowCamera(!showCamera)
    }

    // Toggle controls visibility
    const toggleControls = () => {
        setShowControls(!showControls)
    }

    return (
        <div className="relative w-full max-w-5xl h-[70vh] flex flex-col items-center">
            <div className="relative w-full h-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                {/* Camera video (hidden by default) */}
                <video
                    ref={videoRef}
                    className={`absolute top-0 left-0 w-full h-full object-cover ${showCamera ? "opacity-30" : "hidden"}`}
                    playsInline
                />

                {/* Hand landmarks overlay */}
                <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full" />

                {/* Drawing canvas */}
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

                {/* Camera controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-black/50 border-neutral-700 hover:bg-black/70"
                                    onClick={cameraActive ? stopCamera : startCamera}
                                >
                                    {cameraActive ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{cameraActive ? "Stop Camera" : "Start Camera"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {cameraActive && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-black/50 border-neutral-700 hover:bg-black/70"
                                        onClick={toggleCamera}
                                    >
                                        <Hand className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{showCamera ? "Hide Camera" : "Show Camera"}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Controls toggle */}
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 left-4 bg-black/50 border-neutral-700 hover:bg-black/70"
                    onClick={toggleControls}
                >
                    <Palette className="h-4 w-4" />
                </Button>

                {/* Drawing controls */}
                {showControls && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-neutral-700">
                        <div className="flex gap-1">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    className={`w-6 h-6 rounded-full ${color === c ? "ring-2 ring-white" : ""}`}
                                    style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>

                        <div className="h-6 border-l border-neutral-600 mx-1" />

                        <div className="flex items-center gap-2 w-32">
                            <Zap className="h-4 w-4 text-neutral-400" />
                            <Slider
                                value={[brushSize]}
                                min={5}
                                max={30}
                                step={1}
                                onValueChange={(value) => { if (value[0] !== undefined) setBrushSize(value[0]) }}
                            />
                        </div>

                        <div className="h-6 border-l border-neutral-600 mx-1" />

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 bg-black/50 border-neutral-700 hover:bg-black/70"
                                        onClick={clearCanvas}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Clear Canvas</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 bg-black/50 border-neutral-700 hover:bg-black/70"
                                        onClick={downloadCanvas}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download Drawing</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                {/* Status indicator */}
                {cameraActive && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-neutral-700">
                        <Sparkles className={`h-4 w-4 ${isDrawing ? "text-cyan-400" : "text-neutral-400"}`} />
                        <span className="text-xs text-neutral-300">{isDrawing ? "Drawing..." : "Point finger to draw"}</span>
                    </div>
                )}

                {/* Tracking status indicator */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-neutral-700">
                    <div
                        className={`h-2 w-2 rounded-full ${trackingStatus === "error"
                            ? "bg-red-500"
                            : trackingStatus === "initializing"
                                ? "bg-yellow-500"
                                : trackingStatus === "detecting" && handDetected
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-neutral-500"
                            }`}
                    />
                    <span className="text-xs text-neutral-300">
                        {trackingStatus === "error"
                            ? "Tracking error"
                            : trackingStatus === "initializing"
                                ? "Initializing..."
                                : trackingStatus === "ready"
                                    ? "Ready - waiting for camera"
                                    : handDetected
                                        ? "Hand detected"
                                        : "No hands detected"}
                    </span>
                </div>

                {/* Hand detection guide */}
                {cameraActive && !handDetected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 border border-neutral-700 rounded-lg p-4 max-w-xs text-center">
                            <Hand className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                            <p className="text-sm text-neutral-200">
                                No hands detected. Make sure your hand is visible in the camera frame.
                            </p>
                        </div>
                    </div>
                )}

                {/* Start prompt */}
                {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Sparkles className="h-12 w-12 text-cyan-400 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Holographic Hand Drawing</h2>
                        <p className="text-neutral-400 mb-6 text-center max-w-md px-4">
                            Draw in mid-air by pointing your index finger
                        </p>
                        <Button
                            onClick={startCamera}
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Start Camera
                        </Button>
                    </div>
                )}
                {/* Debug Button */}
                {cameraActive && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-4 left-4 bg-black/50 border-neutral-700 hover:bg-black/70 z-10"
                        onClick={() => {
                            // Log debug info to console
                            console.log({
                                handDetected,
                                isDrawing,
                                trackingStatus,
                                handLandmarks: currentHandLandmarks,
                                pointerPosition
                            })
                        }}
                    >
                        <Bug className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
