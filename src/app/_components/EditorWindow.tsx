import type { ReactNode } from "react";

interface EditorWindowProps {
    children: ReactNode;
    title?: string;
}

export function EditorWindow({ children, title = "Editor" }: EditorWindowProps) {
    return (
        <div className="w-full h-full bg-cyber-black/90 backdrop-blur-xl border border-terminal-green/20 rounded-lg overflow-hidden">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between h-8 px-4 bg-terminal-green/10 border-b border-terminal-green/20">
                <div className="terminal-text text-sm text-terminal-green/80">
                    {title}
                </div>
                <div className="flex gap-2">
                    <button className="w-3 h-3 rounded-full bg-terminal-green/20 hover:bg-terminal-green/40 transition-colors" />
                    <button className="w-3 h-3 rounded-full bg-terminal-green/20 hover:bg-terminal-green/40 transition-colors" />
                    <button className="w-3 h-3 rounded-full bg-terminal-green/20 hover:bg-terminal-green/40 transition-colors" />
                </div>
            </div>

            {/* Window Content */}
            <div className="p-4 h-[calc(100%-2rem)]">
                {children}
            </div>
        </div>
    );
} 