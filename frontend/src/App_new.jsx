import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload, Settings, Sparkles, Zap } from 'lucide-react'
import Header from './components/Header'

const API_BASE_URL = 'http://localhost:8000'

const DEFAULT_CONFIGS = {
  modes: [
    { value: "tiny", label: "Tiny - 512×512 (快速)", base_size: 512, image_size: 512, crop_mode: false },
    { value: "small", label: "Small - 640×640 (标准)", base_size: 640, image_size: 640, crop_mode: false },
    { value: "base", label: "Base - 1024×1024 (推荐)", base_size: 1024, image_size: 1024, crop_mode: false },
    { value: "large", label: "Large - 1280×1280 (高质)", base_size: 1280, image_size: 1280, crop_mode: false },
    { value: "gundam", label: "Gundam - 动态分辨率", base_size: 1024, image_size: 640, crop_mode: true }
  ],
  output_formats: [
    { value: "markdown", label: "Markdown 格式", icon: "📄" },
    { value: "ocr", label: "纯文本识别", icon: "📝" },
    { value: "free_ocr", label: "自由识别", icon: "✨" },
    { value: "figure", label: "图表解析", icon: "📊" },
    { value: "description", label: "详细描述", icon: "💬" }
  ],
  default_mode: "base",
  default_format: "markdown"
}

function App() {
  const [configs] = useState(DEFAULT_CONFIGS)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedMode, setSelectedMode] = useState('base')
  const [selectedFormat, setSelectedFormat] = useState('markdown')
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    checkBackend()
  }, [])

  const checkBackend = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/configs`, { timeout: 2000 })
      setBackendAvailable(true)
    } catch {
      setBackendAvailable(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('请先选择文件')
      return
    }

    if (!backendAvailable) {
      setError('后端服务未启动！\n\n当前处于UI预览模式。\n请先启动后端服务以使用OCR功能。')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('mode', selectedMode)
    formData.append('output_format', selectedFormat)
    if (customPrompt.trim()) {
      formData.append('custom_prompt', customPrompt)
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ocr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data.data)
    } catch (err) {
      setError(err.response?.data?.detail || '处理失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header backendAvailable={backendAvailable} />
      
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="glass-effect rounded-3xl p-8 card-shadow animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-white">文件上传</h2>
            </div>
            
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.bmp,.tiff,.webp"
                onChange={handleFileSelect}
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-lg mb-2">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                    className="mt-4 px-4 py-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-lg transition-all text-sm"
                  >
                    重新选择
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-white font-medium text-lg mb-2">
                    拖拽文件到此处，或点击上传
                  </p>
                  <p className="text-gray-400 text-sm">
                    支持 JPG、PNG、PDF、TIFF、WebP、BMP
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {/* Model Mode */}
            <div className="glass-effect rounded-3xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-secondary/20 rounded-xl">
                  <Settings className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-xl font-semibold text-white">模型规格</h2>
              </div>
              
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-lighter border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {configs.modes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Output Format */}
            <div className="glass-effect rounded-3xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-white">输出格式</h2>
              </div>
              
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-lighter border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-accent/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                {configs.output_formats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.icon} {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="glass-effect rounded-3xl p-8 card-shadow animate-slide-up">
            <h2 className="text-lg font-medium text-white mb-4">
              自定义提示词 <span className="text-gray-500 text-sm font-normal">(可选)</span>
            </h2>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="输入自定义提示词，留空则使用默认配置..."
              className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className="w-full py-5 px-8 bg-gradient-to-r from-primary via-secondary to-accent text-white text-lg font-semibold rounded-2xl hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>处理中...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 group-hover:animate-pulse" />
                <span>开始识别</span>
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="glass-effect border border-red-500/30 bg-red-500/10 rounded-2xl p-6 text-red-400 whitespace-pre-line animate-slide-up">
              {error}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="glass-effect rounded-3xl p-8 card-shadow animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">识别结果</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(result.text)}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-lg transition-all text-sm font-medium"
                >
                  复制结果
                </button>
              </div>
              
              <div className="bg-dark-lighter rounded-xl p-6 max-h-96 overflow-y-auto scrollbar-custom border border-white/5">
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.text}
                </pre>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-primary text-xs mb-1">模型规格</p>
                  <p className="text-white font-medium">{result.mode}</p>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <p className="text-accent text-xs mb-1">输出格式</p>
                  <p className="text-white font-medium">{result.output_format}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
