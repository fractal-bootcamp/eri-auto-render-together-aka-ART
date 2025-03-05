"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Download, Share2, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { api } from "~/trpc/react"
import { useUser } from "@clerk/nextjs"

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

interface ArtCanvasProps {
    config?: HarmonistConfig
}

export default function ArtCanvas({ config }: ArtCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const materialRef = useRef<THREE.ShaderMaterial | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const isInitialRender = useRef(true)
    const [preloadedImage, setPreloadedImage] = useState<HTMLImageElement | null>(null)

    // Default shader code
    const defaultVertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    const defaultFragmentShader = `
        uniform float time;
        uniform vec2 resolution;
        uniform float baseFrequency;
        uniform float harmonicRatio;
        uniform float waveNumber;
        uniform float damping;
        uniform float amplitude;
        uniform int mode;
        uniform int colorScheme;
        varying vec2 vUv;
        
        #define PI 3.14159265359
        
        // Circular Chladni pattern
        float circularChladni(vec2 pos, float n) {
            float r = length(pos);
            float theta = atan(pos.y, pos.x);
            
            // Bessel function approximation for circular plate
            float bessel = sin(n * r * PI) / (n * r * PI);
            if (r < 0.01) bessel = 1.0; // Avoid division by zero
            
            return bessel * cos(n * theta);
        }
        
        // Rectangular Chladni pattern
        float rectangularChladni(vec2 pos, float m, float n) {
            // Standing waves on rectangular plate
            return sin(m * PI * pos.x) * sin(n * PI * pos.y);
        }
        
        // Triangular Chladni pattern
        float triangularChladni(vec2 pos, float n) {
            // Simplified triangular pattern
            float a = 1.0;
            float h = sqrt(3.0) / 2.0 * a;
            
            // Barycentric coordinates
            vec2 p = pos - vec2(0.5, 0.5);
            p.y /= h;
            
            float x = p.x;
            float y = p.y;
            
            return sin(n * PI * x) * sin(n * PI * y) * sin(n * PI * (1.0 - x - y));
        }
        
        // Color mapping functions
        vec3 blueColorMap(float v) {
            v = clamp(v, -1.0, 1.0) * 0.5 + 0.5;
            return vec3(0.1, 0.2 + 0.6 * v, 0.4 + 0.6 * v);
        }
        
        vec3 rainbowColorMap(float v) {
            v = clamp(v, -1.0, 1.0) * 0.5 + 0.5;
            return 0.5 + 0.5 * cos(2.0 * PI * (vec3(0.0, 0.33, 0.67) + v));
        }
        
        vec3 monochromeColorMap(float v) {
            v = clamp(v, -1.0, 1.0) * 0.5 + 0.5;
            return vec3(v);
        }
        
        void main() {
            // Center and scale coordinates
            vec2 pos = vUv - 0.5;
            pos *= 2.0; // Scale to [-1, 1]
            
            // Calculate time-dependent frequency
            float freq = baseFrequency * (1.0 + 0.01 * sin(time * 0.1));
            
            // Calculate wave pattern based on mode
            float pattern = 0.0;
            
            if (mode == 0) {
                // Circular mode
                pattern = circularChladni(pos, waveNumber);
            } else if (mode == 1) {
                // Rectangular mode
                pattern = rectangularChladni(pos, waveNumber, waveNumber * harmonicRatio);
            } else {
                // Triangular mode
                pattern = triangularChladni(pos, waveNumber);
            }
            
            // Apply time evolution
            pattern *= cos(time * freq * 0.01);
            
            // Apply damping from center
            float dist = length(pos);
            float dampingFactor = exp(-damping * dist * 10.0);
            pattern *= dampingFactor * amplitude;
            
            // Add some harmonics
            pattern += 0.3 * rectangularChladni(pos, waveNumber * harmonicRatio, waveNumber) 
                    * cos(time * freq * 0.01 * harmonicRatio) * dampingFactor * amplitude;
            
            // Apply color mapping based on color scheme
            vec3 color;
            if (colorScheme == 0) {
                color = blueColorMap(pattern);
            } else if (colorScheme == 1) {
                color = rainbowColorMap(pattern);
            } else {
                color = monochromeColorMap(pattern);
            }
            
            // Add holographic effect
            float holographic = 0.2 * sin(pos.x * 50.0 + time * 0.1) * sin(pos.y * 50.0 + time * 0.1);
            color += holographic * vec3(0.1, 0.3, 0.5);
            
            // Add glow at antinodes
            float glow = smoothstep(0.7, 1.0, abs(pattern));
            color += glow * vec3(0.2, 0.5, 0.8) * dampingFactor;
            
            // Output final color
            gl_FragColor = vec4(color, 0.9);
        }
    `;

    // Default harmonist configuration
    const [harmonistConfig, setHarmonistConfig] = useState<HarmonistConfig>(
        config ?? {
            baseFrequency: 432,
            harmonicRatio: 1.618,
            waveNumber: 8,
            damping: 0.02,
            amplitude: 0.8,
            mode: "circular",
            colorScheme: "blue",
            resolution: 256,
        },
    )

    // Get the current user
    const { user, isSignedIn } = useUser()

    // Setup tRPC mutation
    const createArt = api.art.create.useMutation({
        onSuccess: () => {
            alert('Your artwork has been shared to the Explore page and saved to your account!')
        },
        onError: (error) => {
            console.error("Error saving artwork to database:", error)
            alert('Failed to save artwork to your account, but it has been shared to the local Explore page.')
        }
    })

    // Preload image if imageUrl is provided - but we're now prioritizing configuration data
    useEffect(() => {
        // We're now prioritizing configuration data over images
        // This hook is kept for backward compatibility but is no longer the primary focus
        if (harmonistConfig.imageUrl) {
            const img = new Image()
            img.src = harmonistConfig.imageUrl
            img.onload = () => {
                // We're not setting preloadedImage anymore to force shader-based rendering
                // setPreloadedImage(img)
                setIsLoading(false)
            }
        }
    }, [harmonistConfig.imageUrl])

    // Update local state when props change
    useEffect(() => {
        if (config) {
            console.log("ArtCanvas received config:", config)

            // Ensure we have all required properties before updating
            if (
                config.baseFrequency !== undefined &&
                config.harmonicRatio !== undefined &&
                config.waveNumber !== undefined &&
                config.damping !== undefined &&
                config.amplitude !== undefined &&
                config.mode !== undefined &&
                config.colorScheme !== undefined &&
                config.resolution !== undefined
            ) {
                console.log("Applying config to local state")
                setHarmonistConfig(config)

                // Force a re-render of the scene
                if (materialRef.current && materialRef.current.uniforms) {
                    console.log("Updating shader material uniforms")
                    if (materialRef.current.uniforms.baseFrequency) {
                        materialRef.current.uniforms.baseFrequency.value = config.baseFrequency
                    }
                    if (materialRef.current.uniforms.harmonicRatio) {
                        materialRef.current.uniforms.harmonicRatio.value = config.harmonicRatio
                    }
                    if (materialRef.current.uniforms.waveNumber) {
                        materialRef.current.uniforms.waveNumber.value = config.waveNumber
                    }
                    if (materialRef.current.uniforms.damping) {
                        materialRef.current.uniforms.damping.value = config.damping
                    }
                    if (materialRef.current.uniforms.amplitude) {
                        materialRef.current.uniforms.amplitude.value = config.amplitude
                    }
                    if (materialRef.current.uniforms.mode) {
                        materialRef.current.uniforms.mode.value = config.mode === "circular" ? 0 : config.mode === "rectangular" ? 1 : 2
                    }
                    if (materialRef.current.uniforms.colorScheme) {
                        materialRef.current.uniforms.colorScheme.value = config.colorScheme === "blue" ? 0 : config.colorScheme === "rainbow" ? 1 : 2
                    }
                    materialRef.current.needsUpdate = true
                }
            } else {
                console.warn("Received incomplete config, some properties are undefined")
            }
        }
    }, [config])

    // Initialize Three.js scene
    useEffect(() => {
        if (!canvasRef.current) return

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true,
        })
        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setClearColor(0xf5f0e6, 1)
        rendererRef.current = renderer

        // Setup scene
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Setup camera
        const camera = new THREE.PerspectiveCamera(
            75,
            canvasRef.current.clientWidth / canvasRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.z = 1.5
        cameraRef.current = camera

        // Cleanup
        return () => {
            if (rendererRef.current) {
                rendererRef.current.dispose()
            }
            if (materialRef.current) {
                materialRef.current.dispose()
            }
        }
    }, [])

    // Initialize or update shader material when configuration changes
    useEffect(() => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return

        // Clear existing scene
        if (sceneRef.current) {
            // Clear all children from the scene
            while (sceneRef.current.children.length > 0) {
                const child = sceneRef.current.children[0]
                if (child) {
                    sceneRef.current.remove(child)
                }
            }
        }

        // We're now prioritizing configuration data over images
        // This block is commented out to force shader-based rendering
        /*
        if (preloadedImage) {
            const texture = new THREE.Texture(preloadedImage)
            texture.needsUpdate = true
            
            const geometry = new THREE.PlaneGeometry(2, 2)
            const material = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true
            })
            const mesh = new THREE.Mesh(geometry, material)
            sceneRef.current.add(mesh)
            
            // Render the scene
            rendererRef.current.render(sceneRef.current, cameraRef.current)
            setIsLoading(false)
            return
        }
        */

        // Create Chladni plate shader material
        const fragmentShader = harmonistConfig.shaderCode?.fragmentShader || defaultFragmentShader
        const vertexShader = harmonistConfig.shaderCode?.vertexShader || defaultVertexShader

        console.log("Creating shader material with config:", {
            baseFrequency: harmonistConfig.baseFrequency,
            harmonicRatio: harmonistConfig.harmonicRatio,
            waveNumber: harmonistConfig.waveNumber,
            damping: harmonistConfig.damping,
            amplitude: harmonistConfig.amplitude,
            mode: harmonistConfig.mode,
            colorScheme: harmonistConfig.colorScheme
        })

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(canvasRef.current!.width, canvasRef.current!.height) },
                baseFrequency: { value: harmonistConfig.baseFrequency },
                harmonicRatio: { value: harmonistConfig.harmonicRatio },
                waveNumber: { value: harmonistConfig.waveNumber },
                damping: { value: harmonistConfig.damping },
                amplitude: { value: harmonistConfig.amplitude },
                mode: { value: harmonistConfig.mode === "circular" ? 0 : harmonistConfig.mode === "rectangular" ? 1 : 2 },
                colorScheme: { value: harmonistConfig.colorScheme === "blue" ? 0 : harmonistConfig.colorScheme === "rainbow" ? 1 : 2 },
            },
            fragmentShader,
            vertexShader,
        })
        materialRef.current = material

        // Create a plane geometry that fills the screen
        const geometry = new THREE.PlaneGeometry(2, 2)
        const mesh = new THREE.Mesh(geometry, material)
        sceneRef.current.add(mesh)

        // Animation loop
        const animate = () => {
            if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return

            // If we have a shader material, update its time uniform
            if (materialRef.current && materialRef.current.uniforms.time) {
                materialRef.current.uniforms.time.value += 0.01
            }

            rendererRef.current.render(sceneRef.current, cameraRef.current)
            requestAnimationFrame(animate)
        }

        // Start animation
        const animationFrameId = requestAnimationFrame(animate)
        setIsLoading(false)

        // Cleanup animation frame on unmount or when dependencies change
        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [
        harmonistConfig.baseFrequency,
        harmonistConfig.harmonicRatio,
        harmonistConfig.waveNumber,
        harmonistConfig.damping,
        harmonistConfig.amplitude,
        harmonistConfig.mode,
        harmonistConfig.colorScheme,
        harmonistConfig.resolution,
        harmonistConfig.shaderCode,
        defaultFragmentShader,
        defaultVertexShader
    ])

    useEffect(() => {
        if (materialRef.current && materialRef.current.uniforms) {
            // Update uniforms with current configuration
            if (materialRef.current.uniforms.baseFrequency?.value !== undefined) {
                materialRef.current.uniforms.baseFrequency.value = harmonistConfig.baseFrequency
            }

            if (materialRef.current.uniforms.harmonicRatio?.value !== undefined) {
                materialRef.current.uniforms.harmonicRatio.value = harmonistConfig.harmonicRatio
            }

            if (materialRef.current.uniforms.waveNumber?.value !== undefined) {
                materialRef.current.uniforms.waveNumber.value = harmonistConfig.waveNumber
            }

            if (materialRef.current.uniforms.damping?.value !== undefined) {
                materialRef.current.uniforms.damping.value = harmonistConfig.damping
            }

            if (materialRef.current.uniforms.amplitude?.value !== undefined) {
                materialRef.current.uniforms.amplitude.value = harmonistConfig.amplitude
            }

            if (materialRef.current.uniforms.mode?.value !== undefined) {
                materialRef.current.uniforms.mode.value =
                    harmonistConfig.mode === "circular" ? 0 : harmonistConfig.mode === "rectangular" ? 1 : 2
            }

            if (materialRef.current.uniforms.colorScheme?.value !== undefined) {
                materialRef.current.uniforms.colorScheme.value =
                    harmonistConfig.colorScheme === "blue" ? 0 : harmonistConfig.colorScheme === "rainbow" ? 1 : 2
            }
        }
    }, [harmonistConfig])

    const exportCanvas = () => {
        if (!canvasRef.current || !rendererRef.current) return

        // Render a frame
        if (sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current)
        }

        // Get the data URL and trigger download
        const dataURL = canvasRef.current.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataURL
        link.download = `Chladni_Pattern_${harmonistConfig.baseFrequency}Hz_${Date.now()}.png`
        link.click()
    }

    const shareToExplore = () => {
        if (!canvasRef.current || !rendererRef.current) return

        // Render a frame
        if (sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current)
        }

        // Get the data URL
        const dataURL = canvasRef.current.toDataURL("image/png")

        // Get the creator name from the authenticated user or use "Guest" as default
        const creatorName = isSignedIn && user ? (user.fullName || user.username || user.firstName || "User") : "Guest"

        // Create a unique ID for the pattern
        const patternId = `harmonic_pattern_${Math.floor(Math.random() * 1000)}`

        // Create a complete configuration with all sections
        const completeConfig = {
            meta: {
                id: patternId,
                version: "1.0.0",
                contributors: [
                    {
                        id: creatorName
                    }
                ],
                tags: [
                    "chladni",
                    "cymatics",
                    "just-intonation"
                ]
            },
            harmonic_parameters: {
                base_frequency: harmonistConfig.baseFrequency,
                harmonic_ratio: harmonistConfig.harmonicRatio,
                wave_number: harmonistConfig.waveNumber,
                damping: harmonistConfig.damping,
                amplitude: harmonistConfig.amplitude,
                mode: harmonistConfig.mode,
                color_scheme: harmonistConfig.colorScheme,
                resolution: harmonistConfig.resolution
            },
            just_intonation: {
                root_frequency: harmonistConfig.baseFrequency,
                tuning_system: "Just Major",
                ratios: [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2],
                root_note: "A",
                octave: 4,
                selected_harmonics: [1, 3, 5, 7]
            }
        }

        // Create a configuration based on the current state (for backward compatibility)
        const config = {
            id: patternId,
            title: `Pattern ${harmonistConfig.baseFrequency.toFixed(1)}Hz - ${harmonistConfig.mode}`,
            creator: creatorName,
            timestamp: Date.now(),
            likes: 0,
            isLiked: false,
            imageUrl: dataURL,
            harmonic_parameters: {
                base_frequency: harmonistConfig.baseFrequency,
                harmonic_ratio: harmonistConfig.harmonicRatio,
                wave_number: harmonistConfig.waveNumber,
                damping: harmonistConfig.damping,
                amplitude: harmonistConfig.amplitude,
                mode: harmonistConfig.mode,
                color_scheme: harmonistConfig.colorScheme,
                resolution: harmonistConfig.resolution,
            }
        }

        // Save to localStorage for non-authenticated users or as a backup
        try {
            // Save both the complete config and the backward-compatible config
            const savedArtworks = JSON.parse(localStorage.getItem('sharedArtworks') || '[]')
            const updatedArtworks = Array.isArray(savedArtworks) ? savedArtworks : [savedArtworks]
            updatedArtworks.push(config)
            localStorage.setItem('sharedArtworks', JSON.stringify(updatedArtworks))

            // Also save the complete configuration
            const savedCompleteArtworks = JSON.parse(localStorage.getItem('sharedCompleteArtworks') || '[]')
            const updatedCompleteArtworks = Array.isArray(savedCompleteArtworks) ? savedCompleteArtworks : [savedCompleteArtworks]
            updatedCompleteArtworks.push(completeConfig)
            localStorage.setItem('sharedCompleteArtworks', JSON.stringify(updatedCompleteArtworks))
        } catch (error) {
            console.error("Error saving artwork to localStorage:", error)
        }

        // If user is signed in, save to database using tRPC
        if (isSignedIn && user) {
            try {
                // Create a stringified version of the complete configuration for the database
                const configForDb = JSON.stringify(completeConfig)

                // Save to database using tRPC
                createArt.mutate({
                    title: `Pattern ${harmonistConfig.baseFrequency.toFixed(1)}Hz - ${harmonistConfig.mode}`,
                    code: configForDb,
                    thumbnail: dataURL,
                    isPublic: true,
                    harmonicParameters: {
                        baseFrequency: harmonistConfig.baseFrequency,
                        harmonicRatio: harmonistConfig.harmonicRatio,
                        waveNumber: harmonistConfig.waveNumber,
                        damping: harmonistConfig.damping,
                        amplitude: harmonistConfig.amplitude,
                        mode: harmonistConfig.mode,
                        colorScheme: harmonistConfig.colorScheme,
                        resolution: harmonistConfig.resolution
                    }
                })
            } catch (error) {
                console.error("Error saving artwork to database:", error)
                alert("There was an error saving your artwork to the database. It has been saved locally instead.")
            }
        } else {
            alert("Your artwork has been shared to the Explore page! Login to save it to your account.")
        }
    }

    const exportConfig = () => {
        // Create a configuration based on the current state
        const config = {
            meta: {
                id: `harmonic_pattern_${Math.floor(Math.random() * 1000)}`,
                version: "1.0.0",
                contributors: [{ id: "user_1", role: "harmonist" }],
                tags: ["chladni", "cymatics", "just-intonation"],
            },
            harmonic_parameters: {
                base_frequency: harmonistConfig.baseFrequency,
                harmonic_ratio: harmonistConfig.harmonicRatio,
                wave_number: harmonistConfig.waveNumber,
                damping: harmonistConfig.damping,
                amplitude: harmonistConfig.amplitude,
                mode: harmonistConfig.mode,
                color_scheme: harmonistConfig.colorScheme,
                resolution: harmonistConfig.resolution,
            },
            just_intonation: {
                root_frequency: harmonistConfig.baseFrequency,
                ratios: [
                    1, // Unison
                    9 / 8, // Major second
                    5 / 4, // Major third
                    4 / 3, // Perfect fourth
                    3 / 2, // Perfect fifth
                    5 / 3, // Major sixth
                    15 / 8, // Major seventh
                    2, // Octave
                ],
            },
            shader_code: harmonistConfig.shaderCode,
        }

        // Convert to JSON and download
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2))
        const link = document.createElement("a")
        link.href = dataStr
        link.download = `Chladni_Config_${harmonistConfig.baseFrequency}Hz_${Date.now()}.json`
        link.click()
    }

    // Add drag functionality
    const [isDragging, setIsDragging] = useState(false)
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Add resize functionality
    const [canvasSize, setCanvasSize] = useState({ width: 100, height: 100 })
    const [isResizing, setIsResizing] = useState(false)
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
    const [resizeStartSize, setResizeStartSize] = useState({ width: 100, height: 100 })
    const [resizeDirection, setResizeDirection] = useState<string | null>(null)

    // Zoom functionality
    const zoomStep = 10 // percentage
    const minZoom = 50 // minimum size percentage
    const maxZoom = 200 // maximum size percentage
    const [zoomLevel, setZoomLevel] = useState(100)

    const handleZoomIn = () => {
        if (zoomLevel < maxZoom) {
            const newZoom = Math.min(zoomLevel + zoomStep, maxZoom)
            setZoomLevel(newZoom)
            updateCanvasSize(newZoom)
        }
    }

    const handleZoomOut = () => {
        if (zoomLevel > minZoom) {
            const newZoom = Math.max(zoomLevel - zoomStep, minZoom)
            setZoomLevel(newZoom)
            updateCanvasSize(newZoom)
        }
    }

    const handleResetSize = () => {
        setZoomLevel(100)
        updateCanvasSize(100)
        setCanvasPosition({ x: 0, y: 0 })
    }

    const updateCanvasSize = (zoom: number) => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth
            const containerHeight = containerRef.current.clientHeight

            const baseSize = Math.min(containerWidth, containerHeight) * 0.8
            const newWidth = baseSize * (zoom / 100)
            const newHeight = baseSize * (zoom / 100)

            setCanvasSize({ width: newWidth, height: newHeight })

            // Update Three.js renderer size
            if (rendererRef.current && canvasRef.current) {
                rendererRef.current.setSize(newWidth, newHeight)
                if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.resolution !== undefined) {
                    materialRef.current.uniforms.resolution.value.set(newWidth, newHeight)
                }
                if (cameraRef.current) {
                    cameraRef.current.aspect = newWidth / newHeight
                    cameraRef.current.updateProjectionMatrix()
                }
            }
        }
    }

    // Initialize canvas size based on container
    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth
            const containerHeight = containerRef.current.clientHeight

            const baseSize = Math.min(containerWidth, containerHeight) * 0.8
            setCanvasSize({ width: baseSize, height: baseSize })
        }
    }, [])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (containerRef.current) {
            // Check if we're clicking on a resize handle
            const target = e.target as HTMLElement
            if (target.classList.contains("resize-handle")) {
                setIsResizing(true)
                setResizeStart({
                    x: e.clientX,
                    y: e.clientY,
                })
                setResizeStartSize({
                    width: canvasSize.width,
                    height: canvasSize.height,
                })
                setResizeDirection(target.dataset.direction || null)
            } else {
                // Otherwise, it's a drag operation
                setIsDragging(true)
                setDragPosition({
                    x: e.clientX,
                    y: e.clientY,
                })
            }
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isResizing && resizeDirection) {
            const dx = e.clientX - resizeStart.x
            const dy = e.clientY - resizeStart.y

            let newWidth = resizeStartSize.width
            let newHeight = resizeStartSize.height

            // Maintain aspect ratio (1:1 for Chladni patterns)
            const aspectRatio = 1

            if (resizeDirection.includes("e") || resizeDirection.includes("w")) {
                newWidth = resizeStartSize.width + (resizeDirection.includes("e") ? dx : -dx)
                newHeight = newWidth / aspectRatio
            }

            if (resizeDirection.includes("s") || resizeDirection.includes("n")) {
                newHeight = resizeStartSize.height + (resizeDirection.includes("s") ? dy : -dy)
                newWidth = newHeight * aspectRatio
            }

            // Ensure minimum size
            const minSize = 100
            if (newWidth >= minSize && newHeight >= minSize) {
                setCanvasSize({ width: newWidth, height: newHeight })

                // Calculate new zoom level
                if (containerRef.current) {
                    const baseSize = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.8
                    const newZoom = (newWidth / baseSize) * 100
                    setZoomLevel(Math.round(newZoom))
                }
                // Update Three.js renderer size
                if (rendererRef.current && canvasRef.current) {
                    rendererRef.current.setSize(newWidth, newHeight)
                    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.resolution) {
                        materialRef.current.uniforms.resolution.value.set(newWidth, newHeight)
                    }
                    if (cameraRef.current) {
                        cameraRef.current.aspect = newWidth / newHeight
                        cameraRef.current.updateProjectionMatrix()
                    }
                }
            }
        } else if (isDragging) {
            const dx = e.clientX - dragPosition.x
            const dy = e.clientY - dragPosition.y

            setCanvasPosition((prev) => ({
                x: prev.x + dx,
                y: prev.y + dy,
            }))

            setDragPosition({
                x: e.clientX,
                y: e.clientY,
            })
        }

        // Update canvas size based on zoom level
        if (materialRef.current?.uniforms?.resolution !== undefined) {
            const width = canvasRef.current?.offsetWidth ?? 0
            const height = canvasRef.current?.offsetHeight ?? 0

            const newWidth = width * zoomLevel / 100
            const newHeight = height * zoomLevel / 100

            if (rendererRef.current) {
                rendererRef.current.setSize(newWidth, newHeight)
            }

            materialRef.current.uniforms.resolution.value.set(newWidth, newHeight)
        }

        // Update uniforms with mouse position
        if (materialRef.current?.uniforms?.resolution && materialRef.current.uniforms.mousePosition) {
            const width = materialRef.current.uniforms.resolution.value.x
            const height = materialRef.current.uniforms.resolution.value.y

            // Calculate normalized mouse position
            const mouseX = (e.clientX - canvasRef.current!.getBoundingClientRect().left) / width
            const mouseY = 1.0 - (e.clientY - canvasRef.current!.getBoundingClientRect().top) / height

            // Update mouse position uniform
            materialRef.current.uniforms.mousePosition.value.set(mouseX, mouseY)
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        setIsResizing(false)
    }

    const handleDoubleClick = () => {
        // Reset position on double click
        setCanvasPosition({ x: 0, y: 0 })
    }

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full border border-gray-300 rounded-md overflow-hidden bg-[#f5f0e6] flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? "grabbing" : isResizing ? "nwse-resize" : "grab" }}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-blue-600" />
                </div>
            )}

            <div
                className="relative"
                style={{
                    transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
                    transition: isDragging || isResizing ? "none" : "transform 0.1s ease-out",
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                }}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
            >
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Resize handles */}
                <div className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-20" data-direction="se">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22 22L12 22M22 22L22 12M22 22L11 11"
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="resize-handle absolute top-0 right-0 w-6 h-6 cursor-nesw-resize z-20" data-direction="ne">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: "rotate(-90deg)" }}
                    >
                        <path
                            d="M22 22L12 22M22 22L22 12M22 22L11 11"
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="resize-handle absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-20" data-direction="sw">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: "rotate(90deg)" }}
                    >
                        <path
                            d="M22 22L12 22M22 22L22 12M22 22L11 11"
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="resize-handle absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-20" data-direction="nw">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: "rotate(180deg)" }}
                    >
                        <path
                            d="M22 22L12 22M22 22L22 12M22 22L11 11"
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>

            <div className="absolute top-4 left-4 text-sm font-mono bg-black/20 backdrop-blur-sm px-3 py-1 rounded-md text-white z-10">
                {harmonistConfig.baseFrequency.toFixed(2)} Hz | Mode: {harmonistConfig.mode}
            </div>

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex gap-1 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    className="h-8 w-8 bg-black/20 backdrop-blur-sm border-none text-white hover:bg-black/30"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="bg-black/20 backdrop-blur-sm text-white px-2 rounded-md flex items-center text-xs font-mono">
                    {zoomLevel}%
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    className="h-8 w-8 bg-black/20 backdrop-blur-sm border-none text-white hover:bg-black/30"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetSize}
                    className="h-8 w-8 bg-black/20 backdrop-blur-sm border-none text-white hover:bg-black/30"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCanvas}
                    className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export Image
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToExplore}
                    className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share to Explore
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportConfig}
                    className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    Export Config
                </Button>
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-gray-500 z-10">
                Double-click to center • Drag to move • Corners to resize
            </div>
        </div>
    )
}
