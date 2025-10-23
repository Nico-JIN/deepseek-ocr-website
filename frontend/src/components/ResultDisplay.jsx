import React from 'react'
import ReactMarkdown from 'react-markdown'
import { FileText, Copy, Check, Sparkles } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

const ResultDisplay = ({ result, loading, selectedFormat }) => {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/10">
        <LoadingSpinner text="AI正在处理中..." />
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="glass-effect rounded-2xl p-5 shadow-2xl border border-white/10">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>识别结果</span>
        </h2>
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制
            </>
          )}
        </button>
      </div>
      
      <div className="bg-gradient-to-br from-dark-lighter to-dark rounded-xl p-5 max-h-[500px] overflow-y-auto scrollbar-hide border border-white/5 shadow-inner">
        {selectedFormat === 'markdown' ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{result.text}</ReactMarkdown>
          </div>
        ) : (
          <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
            {result.text}
          </pre>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-xs mb-1 flex items-center gap-1">
              <span>⚙️</span>
              <span>使用模式</span>
            </p>
            <p className="text-white font-semibold text-sm">{result.mode}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 text-xs mb-1 flex items-center gap-1">
              <span>📄</span>
              <span>输出格式</span>
            </p>
            <p className="text-white font-semibold text-sm">{result.output_format}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultDisplay
