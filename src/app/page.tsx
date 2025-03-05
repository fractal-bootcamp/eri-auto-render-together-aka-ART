"use client"

import { useState } from "react"
import LandingPage from "~/app/_components/landing-page"

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  const handleCloseWindow = () => {
    setShowLanding(false)
    setShowEditor(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-pastel-lavender">
      {/* Soft gradient background */}
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          background: `
            linear-gradient(120deg, 
              rgba(191, 223, 255, 0.4) 0%, 
              rgba(230, 230, 250, 0.6) 50%,
              rgba(255, 209, 220, 0.4) 100%)
          `,
        }}
      />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, #FFD1DC 0%, transparent 8%),
            radial-gradient(circle at 80% 40%, #BFDFFF 0%, transparent 8%),
            radial-gradient(circle at 40% 80%, #C1E1C1 0%, transparent 8%),
            radial-gradient(circle at 60% 10%, #FFEFD5 0%, transparent 8%)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      {showLanding && <LandingPage onCloseWindow={handleCloseWindow} />}


    </main>
  )
}
