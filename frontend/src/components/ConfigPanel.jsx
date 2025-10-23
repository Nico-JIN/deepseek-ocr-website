import React from 'react'
import { Settings, Cpu, FileText, MessageSquare, ChevronDown } from 'lucide-react'

const ConfigPanel = ({
  configs,
  selectedMode,
  selectedFormat,
  customPrompt,
  onModeChange,
  onFormatChange,
  onPromptChange,
}) => {
  const selectedModeLabel = configs.modes.find(m => m.value === selectedMode)?.label || 'Base'
  const selectedFormatLabel = configs.output_formats.find(f => f.value === selectedFormat)?.label || 'Markdown'
  
  return (
    <div className="glass-effect rounded-2xl p-5 space-y-4 shadow-2xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 pb-3 border-b border-white/10">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Settings className="w-4 h-4" />
        </div>
        <span>配置选项</span>
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {/* 模型规格选择 */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            模型规格
          </label>
          <div className="relative">
            <select
              value={selectedMode}
              onChange={(e) => onModeChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg text-white text-sm font-medium appearance-none cursor-pointer hover:border-blue-400/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all shadow-lg"
            >
              {configs.modes.map((mode) => (
                <option key={mode.value} value={mode.value} className="bg-dark-lighter">
                  {mode.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
          </div>
        </div>
        
        {/* 输出格式选择 */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
            <FileText className="w-3.5 h-3.5 text-green-400" />
            输出格式
          </label>
          <div className="relative">
            <select
              value={selectedFormat}
              onChange={(e) => onFormatChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-white text-sm font-medium appearance-none cursor-pointer hover:border-green-400/50 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all shadow-lg"
            >
              {configs.output_formats.map((format) => (
                <option key={format.value} value={format.value} className="bg-dark-lighter">
                  {format.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* 自定义提示词 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          自定义提示词（可选）
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="留空则使用默认提示词..."
          className="w-full px-3 py-2.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none shadow-lg"
          rows={2}
        />
      </div>
    </div>
  )
}

export default ConfigPanel
