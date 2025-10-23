import React, { useState } from 'react'
import { Wifi, WifiOff, Github, Settings } from 'lucide-react'
import logo from '../logo.svg'

const Header = ({ backendAvailable = false, language = 'en', onLanguageChange = () => {}, labels = {} }) => {
  const [open, setOpen] = useState(false)

  const handleLanguageChange = (value) => {
    setOpen(false)
    onLanguageChange(value)
  }

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
              {labels.title}
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
                  <span className="hidden sm:inline">{labels.connected}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{labels.preview}</span>
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
            
             {/* Settings */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline-block">{labels.settings}</span>
              </button>
              {open && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-dark/90 backdrop-blur-xl shadow-lg z-10"
                  onMouseLeave={() => setOpen(false)}
                >
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${language === 'en' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    {labels.languageEnglish}
                  </button>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${language === 'zh' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                    onClick={() => handleLanguageChange('zh')}
                  >
                    {labels.languageChinese}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
