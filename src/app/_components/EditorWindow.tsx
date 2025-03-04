import type { ReactNode } from "react";

interface EditorWindowProps {
    children: ReactNode;
    title?: string;
}

export function EditorWindow({ children, title = "Editor" }: EditorWindowProps) {
    return (
        <div className="w-full h-full bg-white/90 backdrop-blur-sm border border-pastel-blue/30 rounded-lg overflow-hidden shadow-soft">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between h-10 px-4 bg-gradient-to-r from-pastel-blue/20 to-pastel-pink/20 border-b border-pastel-blue/20">
                <div className="text-sm text-gray-600 font-medium">
                    {title}
                </div>
                <div className="flex gap-2">
                    <button className="w-3 h-3 rounded-full bg-pastel-pink/50 hover:bg-pastel-pink/80 transition-colors" />
                    <button className="w-3 h-3 rounded-full bg-pastel-yellow/50 hover:bg-pastel-yellow/80 transition-colors" />
                    <button className="w-3 h-3 rounded-full bg-pastel-green/50 hover:bg-pastel-green/80 transition-colors" />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
} 