"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Save, Upload, Code, Wand2, Play, Pause, FileCode, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"



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

// Define the keys for tuning systems to avoid type errors
type TuningSystemKey = 'Pythagorean' | 'Just Major' | 'Just Minor' | 'Quarter-comma Meantone' | '5-limit' | '7-limit';

// Define the keys for notes to avoid type errors
type NoteKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

// Just intonation ratios
const justIntonationRatios: Record<TuningSystemKey, number[]> = {
    Pythagorean: [1, 9 / 8, 81 / 64, 4 / 3, 3 / 2, 27 / 16, 243 / 128, 2],
    "Just Major": [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2],
    "Just Minor": [1, 9 / 8, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 9 / 5, 2],
    "Quarter-comma Meantone": [1, 8 / 9, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2],
    "5-limit": [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2],
    "7-limit": [1, 8 / 7, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 7 / 4, 2],
}

// Harmonic series
const harmonicSeries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

interface ConfigPanelProps {
    onConfigChange: (config: HarmonistConfig) => void
    initialConfig: HarmonistConfig
}

export default function ConfigPanel({ onConfigChange, initialConfig }: ConfigPanelProps) {

    const [configText, setConfigText] = useState("")
    const [showJson, setShowJson] = useState(false)
    const [isPlaying, setIsPlaying] = useState(true)
    const [codeEditorMode, setCodeEditorMode] = useState<"fragment" | "vertex">("fragment")
    const [fragmentShaderCode, setFragmentShaderCode] = useState("")
    const [vertexShaderCode, setVertexShaderCode] = useState("")
    const [shaderError, setShaderError] = useState<string | null>(null)
    const [showCodeEditor, setShowCodeEditor] = useState(false)

    // Prevent initial render from triggering updates
    const isInitialMount = useRef(true)

    // Harmonist configuration - initialize from props
    const [harmonistConfig, setHarmonistConfig] = useState<HarmonistConfig>(initialConfig)

    // Just intonation settings
    const [tuningSystem, setTuningSystem] = useState<TuningSystemKey>("Just Major")
    const [rootNote, setRootNote] = useState<NoteKey>("A")
    const [octave, setOctave] = useState(4)
    const [selectedHarmonics, setSelectedHarmonics] = useState([1, 3, 5, 7])

    // Update the parent component when config changes, but only after initial mount
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        // Only call onConfigChange when our local state changes, not on initial render
        onConfigChange(harmonistConfig)
    }, [harmonistConfig, onConfigChange])

    // Update local state when initialConfig changes
    useEffect(() => {
        console.log("ConfigPanel received initialConfig:", initialConfig)

        // Ensure we have all required properties before updating
        if (
            initialConfig.baseFrequency !== undefined &&
            initialConfig.harmonicRatio !== undefined &&
            initialConfig.waveNumber !== undefined &&
            initialConfig.damping !== undefined &&
            initialConfig.amplitude !== undefined &&
            initialConfig.mode !== undefined &&
            initialConfig.colorScheme !== undefined &&
            initialConfig.resolution !== undefined
        ) {
            console.log("Applying initialConfig to local state")
            setHarmonistConfig(initialConfig)

            // Update shader code if present
            if (initialConfig.shaderCode) {
                if (initialConfig.shaderCode.fragmentShader) {
                    setFragmentShaderCode(initialConfig.shaderCode.fragmentShader)
                }
                if (initialConfig.shaderCode.vertexShader) {
                    setVertexShaderCode(initialConfig.shaderCode.vertexShader)
                }
            }

            // Check for complete configuration in localStorage
            const completeConfigJson = localStorage.getItem('selectedArtworkComplete')
            if (completeConfigJson) {
                try {
                    const completeConfig = JSON.parse(completeConfigJson)
                    console.log("Found complete configuration:", completeConfig)

                    // Update tuning system settings if available
                    if (completeConfig.just_intonation) {
                        const ji = completeConfig.just_intonation
                        if (ji.tuning_system) {
                            setTuningSystem(ji.tuning_system as TuningSystemKey)
                        }
                        if (ji.root_note) {
                            setRootNote(ji.root_note as NoteKey)
                        }
                        if (ji.octave !== undefined) {
                            setOctave(ji.octave)
                        }
                        if (ji.selected_harmonics && Array.isArray(ji.selected_harmonics)) {
                            setSelectedHarmonics(ji.selected_harmonics)
                        }
                    }

                    // Generate JSON representation for the config text area
                    setConfigText(JSON.stringify(completeConfig, null, 2))

                    // Remove from localStorage to prevent reloading
                    localStorage.removeItem('selectedArtworkComplete')
                } catch (error) {
                    console.error("Error parsing complete configuration:", error)
                    // Fall back to simple config
                    setConfigText(JSON.stringify(initialConfig, null, 2))
                }
            } else {
                // Generate JSON representation for the config text area
                setConfigText(JSON.stringify(initialConfig, null, 2))
            }
        } else {
            console.warn("Received incomplete initialConfig, some properties are undefined")
        }
    }, [initialConfig])

    // Initialize shader code from default values
    useEffect(() => {
        // Default fragment shader code
        const defaultFragmentShader = `uniform float time;
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
}`

        // Default vertex shader code
        const defaultVertexShader = `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

        setFragmentShaderCode(defaultFragmentShader)
        setVertexShaderCode(defaultVertexShader)
    }, [])


    const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string) as Record<string, unknown>
                setConfigText(JSON.stringify(json, null, 2))

                // Update harmonist config if available
                if (json.harmonic_parameters && typeof json.harmonic_parameters === 'object') {
                    const params = json.harmonic_parameters as Record<string, unknown>
                    setHarmonistConfig((prev) => ({
                        ...prev,
                        baseFrequency: typeof params.base_frequency === 'number' ? params.base_frequency : prev.baseFrequency,
                        harmonicRatio: typeof params.harmonic_ratio === 'number' ? params.harmonic_ratio : prev.harmonicRatio,
                        waveNumber: typeof params.wave_number === 'number' ? params.wave_number : prev.waveNumber,
                        damping: typeof params.damping === 'number' ? params.damping : prev.damping,
                        amplitude: typeof params.amplitude === 'number' ? params.amplitude : prev.amplitude,
                        mode: typeof params.mode === 'string' &&
                            (params.mode === 'circular' || params.mode === 'rectangular' || params.mode === 'triangular')
                            ? params.mode as "circular" | "rectangular" | "triangular"
                            : prev.mode,
                        colorScheme: typeof params.color_scheme === 'string' &&
                            (params.color_scheme === 'blue' || params.color_scheme === 'rainbow' || params.color_scheme === 'monochrome')
                            ? params.color_scheme as "blue" | "rainbow" | "monochrome"
                            : prev.colorScheme,
                        resolution: typeof params.resolution === 'number' ? params.resolution : prev.resolution,
                    }))
                }
            } catch (error) {
                console.error("Error parsing JSON:", error)
            }
        }
        reader.readAsText(file)
    }

    const generateSampleConfig = () => {
        const sampleConfig = {
            meta: {
                id: `harmonic_pattern_${Math.floor(Math.random() * 1000)}`,
                version: "1.0.0",
                contributors: [{ id: "user_1", }],
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
                tuning_system: tuningSystem,
                ratios: justIntonationRatios[tuningSystem],
                root_note: rootNote,
                octave: octave,
                selected_harmonics: selectedHarmonics,
            },
        }

        setConfigText(JSON.stringify(sampleConfig, null, 2))
    }

    const updateHarmonistConfig = (updates: Partial<HarmonistConfig>) => {
        setHarmonistConfig((prev) => {
            return { ...prev, ...updates }
        })
    }

    const applyTuningSystem = () => {
        // Calculate base frequency from root note and octave
        const noteToFrequency: Record<NoteKey, number> = {
            C: 261.63,
            "C#": 277.18,
            D: 293.66,
            "D#": 311.13,
            E: 329.63,
            F: 349.23,
            "F#": 369.99,
            G: 392.0,
            "G#": 415.3,
            A: 440.0,
            "A#": 466.16,
            B: 493.88,
        }

        // Calculate base frequency for the selected note and octave
        const baseFreq = noteToFrequency[rootNote] * Math.pow(2, octave - 4)

        // Update the base frequency
        updateHarmonistConfig({ baseFrequency: baseFreq })
    }

    const applyPreset = (preset: string) => {
        switch (preset) {
            case "chladni-square":
                updateHarmonistConfig({
                    baseFrequency: 440,
                    harmonicRatio: 1.5,
                    waveNumber: 6,
                    damping: 0.01,
                    amplitude: 1.0,
                    mode: "rectangular",
                    colorScheme: "blue",
                })
                break
            case "cymatics-circle":
                updateHarmonistConfig({
                    baseFrequency: 432,
                    harmonicRatio: 1.618,
                    waveNumber: 12,
                    damping: 0.03,
                    amplitude: 0.9,
                    mode: "circular",
                    colorScheme: "rainbow",
                })
                break
            case "harmonic-triangle":
                updateHarmonistConfig({
                    baseFrequency: 396,
                    harmonicRatio: 1.333,
                    waveNumber: 9,
                    damping: 0.02,
                    amplitude: 0.85,
                    mode: "triangular",
                    colorScheme: "monochrome",
                })
                break
        }
    }

    const applyShaderCode = () => {
        try {
            // Create a configuration object with the shader code
            const shaderConfig = {
                fragmentShader: fragmentShaderCode,
                vertexShader: vertexShaderCode,
            }

            // Update the harmonist config with the shader code
            updateHarmonistConfig({
                ...harmonistConfig,
                shaderCode: shaderConfig,
            })

            setShaderError(null)
        } catch (error) {
            console.error("Error applying shader code:", error)
            setShaderError("Failed to apply shader code. Check for syntax errors.")
        }
    }

    const generateExampleShader = (example: string) => {
        let newFragmentShader = fragmentShaderCode

        switch (example) {
            case "wave-interference":
                newFragmentShader = fragmentShaderCode
                    .replace(
                        "// Calculate wave pattern based on mode",
                        `// Calculate wave pattern based on mode
  // Wave interference pattern
  float wave1 = sin(pos.x * waveNumber + time * 0.01);
  float wave2 = sin(pos.y * waveNumber * harmonicRatio + time * 0.01);
  float interference = wave1 * wave2;`,
                    )
                    .replace(
                        "if (mode == 0) {",
                        `if (mode == 0) {
    // Use interference pattern for circular mode
    pattern = interference * circularChladni(pos, waveNumber);`,
                    )
                break

            case "fractal":
                newFragmentShader = fragmentShaderCode
                    .replace(
                        "// Color mapping functions",
                        `// Mandelbrot set calculation
float mandelbrot(vec2 c) {
  vec2 z = vec2(0.0);
  const int maxIterations = 100;
  int iteration = 0;
  
  for (int i = 0; i < maxIterations; i++) {
    iteration = i;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (length(z) > 2.0) break;
  }
  
  return float(iteration) / float(maxIterations);
}

// Color mapping functions`,
                    )
                    .replace(
                        "// Add holographic effect",
                        `// Add fractal effect
  float fractalValue = mandelbrot(pos * 0.5);
  color = mix(color, rainbowColorMap(fractalValue), 0.5);
  
  // Add holographic effect`,
                    )
                break

            case "voronoi":
                newFragmentShader = fragmentShaderCode
                    .replace(
                        "// Color mapping functions",
                        `// Voronoi pattern
float voronoi(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float md = 5.0;
  vec2 m = vec2(0.0);
  
  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      vec2 g = vec2(i, j);
      vec2 o = hash22(n + g);
      o = 0.5 + 0.5 * sin(time * 0.1 + 6.28 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        m = n + g + o;
      }
    }
  }
  return md;
}

// Hash function for voronoi
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Color mapping functions`,
                    )
                    .replace(
                        "// Add holographic effect",
                        `// Add voronoi effect
  float voronoiValue = voronoi(pos * 10.0 * waveNumber);
  color = mix(color, vec3(voronoiValue), 0.3);
  
  // Add holographic effect`,
                    )
                break
        }

        setFragmentShaderCode(newFragmentShader)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-300 font-mono text-sm text-gray-700">
                <div className="flex justify-between items-center">
                    <span>Configuration Panel</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="h-6 w-6">
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowCodeEditor(!showCodeEditor)} className="h-6 w-6">
                            <FileCode size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowJson(!showJson)} className="h-6 w-6">
                            <Code size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={generateSampleConfig} className="h-6 w-6">
                            <Wand2 size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {showJson ? (
                <div className="p-4 flex-1 flex flex-col">
                    <Textarea
                        value={configText}
                        onChange={(e) => setConfigText(e.target.value)}
                        className="flex-1 font-mono text-xs bg-[#f8f5f0] border-gray-300"
                        placeholder="Paste or edit JSON configuration here..."
                    />
                    <div className="flex justify-between mt-4">
                        <div>
                            <input type="file" id="config-upload" className="hidden" accept=".json" onChange={handleImportConfig} />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("config-upload")?.click()}
                                className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                            onClick={() => {
                                try {
                                    const config = JSON.parse(configText)
                                    if (config.harmonic_parameters) {
                                        const params = config.harmonic_parameters
                                        updateHarmonistConfig({
                                            baseFrequency: params.base_frequency || harmonistConfig.baseFrequency,
                                            harmonicRatio: params.harmonic_ratio || harmonistConfig.harmonicRatio,
                                            waveNumber: params.wave_number || harmonistConfig.waveNumber,
                                            damping: params.damping || harmonistConfig.damping,
                                            amplitude: params.amplitude || harmonistConfig.amplitude,
                                            mode: params.mode || harmonistConfig.mode,
                                            colorScheme: params.color_scheme || harmonistConfig.colorScheme,
                                            resolution: params.resolution || harmonistConfig.resolution,
                                        })
                                    }
                                } catch (error) {
                                    console.error("Error applying JSON config:", error)
                                }
                            }}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {showCodeEditor && (
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <FileCode className="mr-2 h-4 w-4" />
                                    <span className="font-mono text-sm">Shader Editor</span>
                                </div>
                                <div className="flex gap-2">
                                    <Select
                                        value={codeEditorMode}
                                        onValueChange={(value: "fragment" | "vertex") => setCodeEditorMode(value)}
                                    >
                                        <SelectTrigger className="w-[140px] h-8 text-xs">
                                            <SelectValue placeholder="Select shader" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fragment">Fragment Shader</SelectItem>
                                            <SelectItem value="vertex">Vertex Shader</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCodeEditor(false)}
                                        className="h-8 bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                                    >
                                        Close Editor
                                    </Button>
                                </div>
                            </div>

                            {shaderError && (
                                <Alert variant="destructive" className="mb-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{shaderError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex-1 flex flex-col">
                                <div className="bg-[#1e1e1e] text-white p-2 text-xs font-mono rounded-t-md">
                                    {codeEditorMode === "fragment" ? "Fragment Shader (GLSL)" : "Vertex Shader (GLSL)"}
                                </div>
                                <Textarea
                                    value={codeEditorMode === "fragment" ? fragmentShaderCode : vertexShaderCode}
                                    onChange={(e) => {
                                        if (codeEditorMode === "fragment") {
                                            setFragmentShaderCode(e.target.value)
                                        } else {
                                            setVertexShaderCode(e.target.value)
                                        }
                                    }}
                                    className="flex-1 font-mono text-xs bg-[#1e1e1e] text-white border-gray-700 rounded-t-none"
                                    style={{ minHeight: "400px", resize: "none", lineHeight: 1.5 }}
                                    spellCheck={false}
                                />
                            </div>

                            <div className="flex justify-between mt-4">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => generateExampleShader("wave-interference")}
                                        className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                                    >
                                        Wave Interference
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => generateExampleShader("fractal")}
                                        className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                                    >
                                        Add Fractal
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => generateExampleShader("voronoi")}
                                        className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                                    >
                                        Add Voronoi
                                    </Button>
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={applyShaderCode}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Apply Shader
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Presets */}
                                <div>
                                    <Label>Pattern Presets</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        <Button
                                            variant="outline"
                                            className="bg-[#f8f5f0] border-gray-300 hover:bg-[#e6e1d6]"
                                            onClick={() => applyPreset("chladni-square")}
                                        >
                                            Square Plate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="bg-[#f8f5f0] border-gray-300 hover:bg-[#e6e1d6]"
                                            onClick={() => applyPreset("cymatics-circle")}
                                        >
                                            Cymatics Circle
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="bg-[#f8f5f0] border-gray-300 hover:bg-[#e6e1d6]"
                                            onClick={() => applyPreset("harmonic-triangle")}
                                        >
                                            Harmonic Triangle
                                        </Button>
                                    </div>
                                </div>

                                {/* Just Intonation Settings */}
                                <div className="border rounded-md p-3 bg-[#f8f5f0]">
                                    <Label className="text-sm font-semibold">Just Intonation Settings</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <Label htmlFor="tuning-system" className="text-xs">
                                                Tuning System
                                            </Label>
                                            <Select value={tuningSystem} onValueChange={(value: TuningSystemKey) => setTuningSystem(value)}>
                                                <SelectTrigger id="tuning-system" className="bg-white">
                                                    <SelectValue placeholder="Select tuning" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(justIntonationRatios).map((system) => (
                                                        <SelectItem key={system} value={system}>
                                                            {system}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="root-note" className="text-xs">
                                                Root Note
                                            </Label>
                                            <div className="flex gap-2">
                                                <Select value={rootNote} onValueChange={(value: NoteKey) => setRootNote(value)}>
                                                    <SelectTrigger id="root-note" className="bg-white">
                                                        <SelectValue placeholder="Note" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((note) => (
                                                            <SelectItem key={note} value={note}>
                                                                {note}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Select value={octave.toString()} onValueChange={(val) => setOctave(Number.parseInt(val))}>
                                                    <SelectTrigger id="octave" className="bg-white w-20">
                                                        <SelectValue placeholder="Oct" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[2, 3, 4, 5, 6].map((oct) => (
                                                            <SelectItem key={oct} value={oct.toString()}>
                                                                {oct}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full bg-white hover:bg-[#e6e1d6]"
                                        onClick={applyTuningSystem}
                                    >
                                        Apply Tuning
                                    </Button>
                                </div>

                                {/* Frequency Controls */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="base-frequency">Base Frequency (Hz)</Label>
                                        <span className="text-sm font-mono">{harmonistConfig.baseFrequency.toFixed(2)} Hz</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            id="base-frequency"
                                            value={[harmonistConfig.baseFrequency]}
                                            min={0.1}
                                            max={100}
                                            step={0.1}
                                            className="flex-1"
                                            onValueChange={(values) => updateHarmonistConfig({ baseFrequency: values[0] })}
                                        />
                                        <Input
                                            type="number"
                                            value={harmonistConfig.baseFrequency.toString()}
                                            onChange={(e) =>
                                                updateHarmonistConfig({ baseFrequency: Number.parseFloat(e.target.value) || 43.2 })
                                            }
                                            className="w-20 bg-[#f8f5f0]"
                                            step={0.1}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="harmonic-ratio">Harmonic Ratio</Label>
                                        <span className="text-sm font-mono">{harmonistConfig.harmonicRatio.toFixed(3)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            id="harmonic-ratio"
                                            value={[harmonistConfig.harmonicRatio]}
                                            min={1}
                                            max={2}
                                            step={0.001}
                                            className="flex-1"
                                            onValueChange={(values) => updateHarmonistConfig({ harmonicRatio: values[0] })}
                                        />
                                        <Input
                                            type="number"
                                            value={harmonistConfig.harmonicRatio.toString()}
                                            onChange={(e) =>
                                                updateHarmonistConfig({ harmonicRatio: Number.parseFloat(e.target.value) || 1.618 })
                                            }
                                            className="w-20 bg-[#f8f5f0]"
                                            step={0.001}
                                        />
                                    </div>
                                </div>

                                {/* Wave Number Control */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="wave-number">Wave Number</Label>
                                        <span className="text-sm font-mono">{harmonistConfig.waveNumber.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            id="wave-number"
                                            value={[harmonistConfig.waveNumber]}
                                            min={1}
                                            max={31}
                                            step={1}
                                            className="flex-1"
                                            onValueChange={(values) => updateHarmonistConfig({ waveNumber: values[0] })}
                                        />
                                        <Input
                                            type="number"
                                            value={harmonistConfig.waveNumber.toString()}
                                            onChange={(e) => updateHarmonistConfig({ waveNumber: Number.parseFloat(e.target.value) || 8 })}
                                            className="w-20 bg-[#f8f5f0]"
                                            step={1}
                                        />
                                    </div>
                                </div>

                                {/* Pattern Mode */}
                                <div>
                                    <Label>Pattern Mode</Label>
                                    <RadioGroup
                                        value={harmonistConfig.mode}
                                        onValueChange={(value: "circular" | "rectangular" | "triangular") =>
                                            updateHarmonistConfig({ mode: value })
                                        }
                                        className="grid grid-cols-3 gap-2 mt-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="circular" id="mode-circular" />
                                            <Label htmlFor="mode-circular" className="text-sm">
                                                Circular
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="rectangular" id="mode-rectangular" />
                                            <Label htmlFor="mode-rectangular" className="text-sm">
                                                Rectangular
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="triangular" id="mode-triangular" />
                                            <Label htmlFor="mode-triangular" className="text-sm">
                                                Triangular
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Color Scheme */}
                                <div>
                                    <Label>Color Scheme</Label>
                                    <RadioGroup
                                        value={harmonistConfig.colorScheme}
                                        onValueChange={(value: "blue" | "rainbow" | "monochrome") =>
                                            updateHarmonistConfig({ colorScheme: value })
                                        }
                                        className="grid grid-cols-3 gap-2 mt-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="blue" id="color-blue" />
                                            <Label htmlFor="color-blue" className="text-sm">
                                                Blue
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="rainbow" id="color-rainbow" />
                                            <Label htmlFor="color-rainbow" className="text-sm">
                                                Rainbow
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="monochrome" id="color-monochrome" />
                                            <Label htmlFor="color-monochrome" className="text-sm">
                                                Monochrome
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Advanced Parameters */}
                                <div className="border rounded-md p-3 bg-[#f8f5f0]">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">Advanced Parameters</Label>
                                    </div>
                                    <div className="space-y-3 mt-2">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="damping" className="text-xs">
                                                    Damping
                                                </Label>
                                                <span className="text-xs font-mono">{harmonistConfig.damping.toFixed(3)}</span>
                                            </div>
                                            <Slider
                                                id="damping"
                                                value={[harmonistConfig.damping]}
                                                min={0}
                                                max={2}
                                                step={0.001}
                                                onValueChange={(values) => updateHarmonistConfig({ damping: values[0] })}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="amplitude" className="text-xs">
                                                    Amplitude
                                                </Label>
                                                <span className="text-xs font-mono">{harmonistConfig.amplitude.toFixed(2)}</span>
                                            </div>
                                            <Slider
                                                id="amplitude"
                                                value={[harmonistConfig.amplitude]}
                                                min={0}
                                                max={500}
                                                step={1}
                                                onValueChange={(values) => updateHarmonistConfig({ amplitude: values[0] })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Harmonic Series */}
                                <div>
                                    <Label>Harmonic Series</Label>
                                    <div className="grid grid-cols-8 gap-1 mt-1">
                                        {harmonicSeries.slice(0, 16).map((harmonic) => (
                                            <Button
                                                key={harmonic}
                                                variant="outline"
                                                size="sm"
                                                className={`text-xs ${selectedHarmonics.includes(harmonic)
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-[#f8f5f0] border-gray-300 hover:bg-[#e6e1d6]"
                                                    }`}
                                                onClick={() => {
                                                    if (selectedHarmonics.includes(harmonic)) {
                                                        setSelectedHarmonics(selectedHarmonics.filter((h) => h !== harmonic))
                                                    } else {
                                                        setSelectedHarmonics([...selectedHarmonics, harmonic])
                                                    }
                                                }}
                                            >
                                                {harmonic}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-300 mt-auto">
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                                    onClick={() => {
                                        updateHarmonistConfig({
                                            baseFrequency: 432,
                                            harmonicRatio: 1.618,
                                            waveNumber: 8,
                                            damping: 0.02,
                                            amplitude: 0.8,
                                            mode: "circular",
                                            colorScheme: "blue",
                                            resolution: 256,
                                        })
                                    }}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-[#f5f0e6] border-gray-400 hover:bg-[#e6e1d6]"
                                    onClick={() => {
                                        // This button doesn't need to do anything now since changes are applied automatically
                                    }}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

