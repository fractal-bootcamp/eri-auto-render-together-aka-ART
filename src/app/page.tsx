"use client"

import { useState } from "react"
import LandingPage from "~/app/_components/landing-page"
import EditorWindow from "~/app/_components/editor-window"
import CodeEditor from "~/app/_components/code-editor"

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleCloseWindow = () => {
    setShowLanding(false)
    setShowEditor(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background pattern similar to the image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "repeating-linear-gradient(45deg, #4b0082, #4b0082 20px, #8a2be2 20px, #8a2be2 40px)",
          opacity: 0.7,
        }}
      />

      {showLanding && <LandingPage onLogin={handleLogin} onCloseWindow={handleCloseWindow} isLoggedIn={isLoggedIn} />}

      {showEditor && (
        <div className="z-10 w-full h-full">
          <EditorWindow>
            <CodeEditor />
          </EditorWindow>
        </div>
      )}
    </main>
  )
}
