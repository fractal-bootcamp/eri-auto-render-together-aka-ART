"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps {
    onLogin: () => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Simple validation
        if (!username || !password) {
            setError("Please enter both username and password")
            return
        }

        // In a real app, you would validate credentials against a backend
        // For this demo, we'll just accept any non-empty values
        setError("")
        onLogin()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                    Username
                </Label>
                <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                    placeholder="Enter your username"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                    Password
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                    placeholder="Enter your password"
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-600">
                Login
            </Button>
        </form>
    )
}

