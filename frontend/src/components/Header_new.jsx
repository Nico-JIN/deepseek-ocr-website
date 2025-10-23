import React from 'react'
import { Sparkles, Wifi, WifiOff } from 'lucide-react'

const Header = ({ backendAvailable = false }) => {
  return (
    <header className="border-b border-white/5 bg-dark/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                DeepSeek<span className="text-primary">-</span>OCR
              </h1>
              <p className="text-gray-400 text-sm font-light">
                视觉文本智能识别平台
              </p>
            </div>
          </div>

          {/* Status and Links */}
          <div className="flex items-center space-x-4">
            {/* Backend Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              backendAvailable 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {backendAvailable ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">已连接</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">预览模式</span>
                </>
              )}
            </div>

            {/* Links */}
            <div className="hidden md:flex items-center space-x-1">
              <a 
                href="https://github.com/deepseek-ai/DeepSeek-OCR" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                GitHub
              </a>
              <a 
                href="https://huggingface.co/deepseek-ai/DeepSeek-OCR"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                🤗 Model
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
