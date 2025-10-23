import React from 'react'
import { Wifi, WifiOff, Github } from 'lucide-react'
import logo from '../logo.svg'

const Header = ({ backendAvailable = false }) => {
  return (
    <header className="border-b border-white/5 bg-dark/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center">
              <img src={logo} alt="DeepSeek AI" className="h-10" />
            </div>
          </div>

          {/* Center Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wide">
              DeepSeek-OCR 实验基地
            </h1>
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
                className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
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
