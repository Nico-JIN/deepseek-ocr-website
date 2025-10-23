import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import axios from 'axios'
import { Upload, Settings, Sparkles, Zap, Copy, Check, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Header from './components/Header'

const API_BASE_URL = 'http://localhost:8000'

const STRINGS = {
  en: {
    headerTitle: 'DeepSeek-OCR Lab',
    statusConnected: 'Connected',
    statusPreview: 'Preview Mode',
    settings: 'Settings',
    languageEnglish: 'English',
    languageChinese: '中文',
    uploadSectionTitle: 'File Upload',
    dropHintTitle: 'Drag files here, or click to upload',
    dropHintSubtitle: 'Supports JPG, PNG, PDF and more',
    pdfFileLabel: 'PDF File',
    doubleClickHint: 'Double-click to preview full content',
    noPreviewText: 'No preview available',
    noPreviewSubtext: 'Upload a file to see the preview here',
    reselectButton: 'Choose Another File',
    previewTitle: 'Source Preview',
    closePreview: 'Close Preview',
    configSectionTitle: 'Configuration',
    modeLabel: 'Model Size',
    formatLabel: 'Output Format',
    promptLabelRequired: 'Target to locate (required)',
    promptLabelOptional: 'Custom prompt (optional)',
    promptRequiredWarning: 'Please provide the target to locate in the image',
    startButton: 'Start Recognition',
    processingButton: 'Processing…',
    cancelButton: 'Stop Recognition',
    cancellingButton: 'Stopping…',
    dragZoneProcessing: 'Processing…',
    pagePreviewTitle: 'Page Preview',
    viewAll: (count) => `View All (${count})`,
    collapseAll: 'Collapse',
    recResultTitle: 'Object Localization Result',
    recResultHint: 'Tip: click the image to view the full size',
    recInfoMode: 'Model',
    recInfoFormat: 'Output Format',
    downloadImage: 'Download',
    recognitionResultTitle: 'Recognition Result',
    waitingForResult: 'Waiting for result…',
    liveUpdating: 'Updating…',
    copyButton: 'Copy',
    copiedButton: 'Copied',
    exportButton: 'Export',
    exportSuccess: 'Export successful',
    loadingText: 'AI is processing…',
    placeholderHeading: 'Results will appear here',
    placeholderBody: 'Upload a file and start recognition to see the output',
    recLoadingTitle: 'Locating objects…',
    recLoadingSubtitle: 'The annotated image will appear once ready',
    cancelNotice: 'Recognition was cancelled',
    singleImagePreviewTitle: 'Recognition Preview',
    resultModalTitle: 'Recognition Result',
    modalClose: 'Close',
    toastRecComplete: 'Localization complete!',
    toastOcrComplete: 'Recognition complete!',
    footerAboutTitle: 'About',
    footerAboutBody: 'An intelligent OCR platform powered by DeepSeek-OCR, supporting multiple document formats and output modes.',
    footerLinksTitle: 'Links',
    footerLinkGithub: 'GitHub Repository',
    footerLinkModel: 'Hugging Face Model',
    footerLinkWebsite: 'DeepSeek Website',
    footerTeamTitle: 'Team',
    footerTeamName: 'No.2 Xiaoming Lab',
    footerTeamDescription: 'Dedicated to AI research and product development.',
    footerCopyright: '© 2024 No.2 Xiaoming Lab. All rights reserved.',
    alertSelectFile: 'Please select a file first',
    alertBackendOffline: 'Backend service is offline. Start the backend server and try again.',
    alertRecPromptRequired: 'Please enter the target you want to locate in the image',
    alertNoTextToCopy: 'There is no text to copy',
    alertCopyFailed: (msg) => `Copy failed: ${msg}`,
    alertNoTextToExport: 'There is no text to export',
    alertExportFailed: (msg) => `Export failed: ${msg}`,
    alertStreamingFailed: (msg) => `Recognition failed\n\n${msg}`,
    alertEmptyResponse: 'Backend returned an empty result',
    defaultStreamingError: 'Streaming failed, please try again',
    defaultProcessingError: 'Processing failed, please try again',
    pageLabel: (page) => `Page ${page}`,
    thumbnailsProcessingLabel: (count) => `Processing ${count} page(s)`,
    toastDuration: (seconds) => `Duration ${seconds}s`,
    toastCharacters: (count) => `${count} chars`,
    toastImageReady: 'Annotated image generated'
  },
  zh: {
    headerTitle: 'DeepSeek-OCR 实验基地',
    statusConnected: '已连接',
    statusPreview: '预览模式',
    settings: '设置',
    languageEnglish: 'English',
    languageChinese: '中文',
    uploadSectionTitle: '文件上传',
    dropHintTitle: '拖拽文件到此处，或点击上传',
    dropHintSubtitle: '支持 JPG、PNG、PDF 等格式',
    pdfFileLabel: 'PDF文件',
    doubleClickHint: '双击查看完整内容',
    noPreviewText: '无可预览内容',
    noPreviewSubtext: '上传文件后将显示预览',
    reselectButton: '重新选择',
    previewTitle: '原文预览',
    closePreview: '关闭预览',
    configSectionTitle: '配置选项',
    modeLabel: '模型规格',
    formatLabel: '输出格式',
    promptLabelRequired: '定位目标（必填）',
    promptLabelOptional: '自定义提示词（可选）',
    promptRequiredWarning: '请输入要在图片中定位的内容',
    startButton: '开始识别',
    processingButton: '处理中...',
    cancelButton: '终止识别',
    cancellingButton: '正在终止...',
    dragZoneProcessing: '处理中...',
    pagePreviewTitle: '页面预览',
    viewAll: (count) => `查看全部 (${count})`,
    collapseAll: '收起',
    recResultTitle: '🎯 对象定位结果',
    recResultHint: '💡 点击图片查看完整大图',
    recInfoMode: '模型规格',
    recInfoFormat: '输出格式',
    downloadImage: '下载',
    recognitionResultTitle: '识别结果',
    waitingForResult: '等待结果...',
    liveUpdating: '实时更新中...',
    copyButton: '复制',
    copiedButton: '已复制',
    exportButton: '导出',
    exportSuccess: '导出成功',
    loadingText: 'AI正在处理中...',
    placeholderHeading: '识别结果将显示在这里',
    placeholderBody: '上传文件并配置选项后，点击“开始识别”按钮',
    recLoadingTitle: '🎯 正在定位对象...',
    recLoadingSubtitle: '处理完成后将显示带标注框的图片',
    cancelNotice: '识别已取消',
    singleImagePreviewTitle: '识别预览',
    resultModalTitle: '识别结果',
    modalClose: '关闭',
    toastRecComplete: '🎯 定位完成！',
    toastOcrComplete: '✅ 识别完成！',
    footerAboutTitle: '关于项目',
    footerAboutBody: '基于 DeepSeek-OCR 的智能文本识别平台，提供高精度的 OCR 识别服务，支持多种文档格式和输出方式。',
    footerLinksTitle: '相关链接',
    footerLinkGithub: 'GitHub 仓库',
    footerLinkModel: 'Hugging Face 模型',
    footerLinkWebsite: 'DeepSeek 官网',
    footerTeamTitle: '开发团队',
    footerTeamName: '二号小明实验室',
    footerTeamDescription: '专注于 AI 技术研究与应用开发',
    footerCopyright: '© 2024 二号小明实验室. 保留所有权利。',
    alertSelectFile: '请先选择文件',
    alertBackendOffline: '后端服务未启动。请先启动后端服务后再试。',
    alertRecPromptRequired: '请输入要在图片中定位的内容',
    alertNoTextToCopy: '没有可复制的内容',
    alertCopyFailed: (msg) => `复制失败：${msg}`,
    alertNoTextToExport: '没有可导出的内容',
    alertExportFailed: (msg) => `导出失败：${msg}`,
    alertStreamingFailed: (msg) => `❌ 识别失败\n\n${msg}`,
    alertEmptyResponse: '后端返回了空结果',
    defaultStreamingError: '流式处理失败，请重试',
    defaultProcessingError: '处理失败，请重试',
    pageLabel: (page) => `第 ${page} 页`,
    thumbnailsProcessingLabel: (count) => `处理中 ${count} 页`,
    toastDuration: (seconds) => `耗时 ${seconds}秒`,
    toastCharacters: (count) => `${count}字符`,
    toastImageReady: '已生成标注图片'
  }
}

const DEFAULT_CONFIGS = {
  modes: [
    { value: 'tiny', label: { en: 'Tiny - 512×512 (Fast)', zh: 'Tiny - 512×512 (快速)' }, base_size: 512, image_size: 512, crop_mode: false },
    { value: 'small', label: { en: 'Small - 640×640 (Standard)', zh: 'Small - 640×640 (标准)' }, base_size: 640, image_size: 640, crop_mode: false },
    { value: 'base', label: { en: 'Base - 1024×1024 (Recommended)', zh: 'Base - 1024×1024 (推荐)' }, base_size: 1024, image_size: 1024, crop_mode: false },
    { value: 'large', label: { en: 'Large - 1280×1280 (High Quality)', zh: 'Large - 1280×1280 (高质)' }, base_size: 1280, image_size: 1280, crop_mode: false },
    { value: 'gundam', label: { en: 'Gundam - Dynamic Resolution', zh: 'Gundam - 动态分辨率' }, base_size: 1024, image_size: 640, crop_mode: true }
  ],
  output_formats: [
    { value: 'markdown', icon: '📄', input_type: 'optional', label: { en: 'Markdown Document', zh: 'Markdown 文档' }, description: { en: '', zh: '' }, placeholder: { en: 'Leave empty to use the default prompt…', zh: '留空使用默认提示词…' } },
    { value: 'ocr', icon: '📝', input_type: 'optional', label: { en: 'OCR Text Recognition', zh: 'OCR 图片识别' }, description: { en: '', zh: '' }, placeholder: { en: 'Leave empty to use the default prompt…', zh: '留空使用默认提示词…' } },
    { value: 'free_ocr', icon: '✨', input_type: 'optional', label: { en: 'Free OCR (No Layout)', zh: '自由识别（无布局）' }, description: { en: '', zh: '' }, placeholder: { en: 'Leave empty to use the default prompt…', zh: '留空使用默认提示词…' } },
    { value: 'figure', icon: '📊', input_type: 'optional', label: { en: 'Figure Analysis', zh: '图表解析' }, description: { en: '', zh: '' }, placeholder: { en: 'Leave empty to use the default prompt…', zh: '留空使用默认提示词…' } },
    { value: 'general', icon: '💬', input_type: 'none', label: { en: 'Detailed Description', zh: '详细描述' }, description: { en: 'Returns a detailed textual description of the image', zh: '返回图片的详细文本描述' } },
    { value: 'rec', icon: '🎯', input_type: 'required', label: { en: 'Object Localization', zh: '对象定位' }, description: { en: 'Returns an annotated image with bounding boxes', zh: '返回带标注框的图片' }, placeholder: { en: 'Enter the object you want to locate, e.g. “red button”', zh: '请输入要定位的内容，如：红色按钮、标题文字等' } }
  ],
  default_mode: 'base',
  default_format: 'markdown'
}

function App() {
  const [configs] = useState(DEFAULT_CONFIGS)
  const [language, setLanguage] = useState('en')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [selectedMode, setSelectedMode] = useState('base')
  const [selectedFormat, setSelectedFormat] = useState('markdown')
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [runPreview, setRunPreview] = useState(null) // {type: 'image'|'pdf', url: string, name: string}
  const [showPreview, setShowPreview] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const timerRef = useRef(null)
  const [streamCtrl, setStreamCtrl] = useState(null)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
  const [previewImageModal, setPreviewImageModal] = useState(null) // {url: string, title: string}
  const [showAllThumbnails, setShowAllThumbnails] = useState(false) // 是否显示全部缩略图
  const [showSuccessToast, setShowSuccessToast] = useState(false) // 识别完成提示
  const [currentJobId, setCurrentJobId] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const cancelledByUserRef = useRef(false)

  const strings = useMemo(() => STRINGS[language] ?? STRINGS.en, [language])
  const t = useCallback((key, ...args) => {
    const value = strings[key] ?? STRINGS.en[key] ?? key
    return typeof value === 'function' ? value(...args) : value
  }, [strings])

  const currentFormatConfig = useMemo(
    () => configs.output_formats.find((f) => f.value === selectedFormat),
    [configs, selectedFormat]
  )

  const getModeLabel = useCallback((mode) => {
    if (!mode) return ''
    if (typeof mode.label === 'string') return mode.label
    return mode.label?.[language] ?? mode.label?.en ?? ''
  }, [language])

  const headerLabels = useMemo(() => ({
    title: t('headerTitle'),
    settings: t('settings'),
    languageEnglish: t('languageEnglish'),
    languageChinese: t('languageChinese'),
    connected: t('statusConnected'),
    preview: t('statusPreview')
  }), [t])

  const getFormatLabel = useCallback((format) => {
    if (!format) return ''
    if (typeof format.label === 'string') return format.label
    return format.label?.[language] ?? format.label?.en ?? ''
  }, [language])

  const getFormatDescription = useCallback((format) => {
    if (!format) return ''
    if (!format.description) return ''
    if (typeof format.description === 'string') return format.description
    return format.description?.[language] ?? format.description?.en ?? ''
  }, [language])

  const getFormatPlaceholder = useCallback((format) => {
    if (!format) return ''
    if (!format.placeholder) return ''
    if (typeof format.placeholder === 'string') return format.placeholder
    return format.placeholder?.[language] ?? format.placeholder?.en ?? ''
  }, [language])

  const getFormatByValue = useCallback((value) => {
    return configs.output_formats.find((f) => f.value === value)
  }, [configs])

  const getStreamingTimeLabel = useCallback((ms) => {
    if (typeof ms !== 'number') return ''
    const seconds = (ms / 1000).toFixed(2)
    return language === 'en' ? ` · Elapsed ${seconds}s` : ` · 已用时 ${seconds}s`
  }, [language])

  const getDurationLabel = useCallback((ms) => {
    if (typeof ms !== 'number') return ''
    const seconds = (ms / 1000).toFixed(2)
    return language === 'en' ? ` · Duration ${seconds}s` : ` · 耗时 ${seconds}s`
  }, [language])

  const getCharacterCountLabel = useCallback((count) => {
    return language === 'en' ? `${count} chars` : `${count} 字符`
  }, [language])

  const sanitizeDisplayText = useCallback((text) => {
    if (!text) return ''
    let sanitized = text
      .replace(/^[\t >*-]*[A-Za-z0-9_\- ]+\s*\(boxes:[^)]*\)\s*(\r?\n)?/gm, '')
      .replace(/\(boxes:[^)]*\)/g, '')
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n')
    return sanitized.trim()
  }, [])

  const displayText = useMemo(() => sanitizeDisplayText(result?.text || ''), [result?.text, sanitizeDisplayText])

  useEffect(() => {
    checkBackend()
    // 每30秒检查一次后端连接
    const interval = setInterval(() => {
      checkBackend()
    }, 30000)
    return () => clearInterval(interval)
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
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      generatePreview(file)
    }
  }

  const handleFormatChange = (value) => {
    setSelectedFormat(value)
    const nextFormat = configs.output_formats.find((f) => f.value === value)
    if (!nextFormat || nextFormat.input_type !== 'required') {
      setCustomPrompt('')
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      generatePreview(file)
    }
  }

  const generatePreview = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target.result)
        // 获取图片原始尺寸
        const img = new Image()
        img.onload = () => {
          setImageNaturalSize({ width: img.width, height: img.height })
          // 计算适应容器的尺寸（最大宽度按容器，高度自适应，但不超过75vh）
          const maxWidth = 800 // 假设容器最大宽度
          const maxHeight = window.innerHeight * 0.75
          let displayWidth = img.width
          let displayHeight = img.height
          
          // 按宽度缩放
          if (displayWidth > maxWidth) {
            const scale = maxWidth / displayWidth
            displayWidth = maxWidth
            displayHeight = displayHeight * scale
          }
          
          // 按高度限制
          if (displayHeight > maxHeight) {
            const scale = maxHeight / displayHeight
            displayHeight = maxHeight
            displayWidth = displayWidth * scale
          }
          
          setPreviewSize({ width: displayWidth, height: displayHeight })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } else if (file.type === 'application/pdf') {
      // 标记为pdf，运行时再创建objectURL用于大预览
      setFilePreview('pdf')
      setImageNaturalSize({ width: 0, height: 0 })
      setPreviewSize({ width: 0, height: 0 })
    } else {
      setFilePreview(null)
      setImageNaturalSize({ width: 0, height: 0 })
      setPreviewSize({ width: 0, height: 0 })
    }
  }

  const handlePreviewClick = (e) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发父元素的点击事件
    if (filePreview && filePreview !== 'pdf') {
      window.open(filePreview, '_blank')
    } else if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      window.open(url, '_blank')
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert(t('alertSelectFile'))
      return
    }

    if (!backendAvailable) {
      alert(t('alertBackendOffline'))
      return
    }

    // 验证 rec 模式必须输入定位目标
    const formatCfg = currentFormatConfig
    const promptValue = customPrompt.trim()

    if (formatCfg?.input_type === 'required' && !promptValue) {
      alert(t('alertRecPromptRequired'))
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    cancelledByUserRef.current = false
    setIsCancelling(false)
    setCurrentJobId(null)
    setShowPreview(true)
    setShowAllThumbnails(false) // 重置缩略图展开状态
    // 启动计时器（从点击开始识别起计时）
    try { if (timerRef.current) clearInterval(timerRef.current) } catch {}
    const t0 = Date.now()
    setElapsedMs(0)
    timerRef.current = setInterval(() => setElapsedMs(Date.now() - t0), 100)
    // 构建运行时大预览
    try {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setRunPreview({ type: 'image', url: e.target.result, name: selectedFile.name })
        reader.readAsDataURL(selectedFile)
      } else if (selectedFile.type === 'application/pdf') {
        const url = URL.createObjectURL(selectedFile)
        setRunPreview({ type: 'pdf', url, name: selectedFile.name })
      } else {
        setRunPreview(null)
      }
    } catch {}

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('mode', selectedMode)
    formData.append('output_format', selectedFormat)
    const shouldIncludePrompt =
      (formatCfg?.input_type === 'required' && !!promptValue) ||
      (formatCfg?.input_type === 'optional' && !!promptValue)

    if (shouldIncludePrompt) {
      formData.append('custom_prompt', promptValue)
    }

    // 使用流式API
    const USE_STREAMING = true

    if (USE_STREAMING) {
      try {
        console.log('🚀 Sending streaming OCR request...')
        
        const controller = new AbortController()
        setStreamCtrl(controller)
        const response = await fetch(`${API_BASE_URL}/api/ocr/stream`, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'text/event-stream' },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulatedText = ''
        let pageResults = []  // 存储每页结果
        let metadata = {}
        let receivedAny = false
        let fallbackCleared = false
        let cancelled = false
        // 动态回退时长：PDF/大文件需要更长时间完成上传与首帧推理
        const isPDF = selectedFile?.type === 'application/pdf'
        const mb = selectedFile?.size ? (selectedFile.size / 1024 / 1024) : 0
        const fallbackMs = isPDF
          ? Math.min(120000, Math.max(20000, Math.floor(mb * 2000) + 15000))
          : Math.min(30000, Math.max(8000, Math.floor(mb * 1000) + 5000))
        const fallbackTimer = setTimeout(async () => {
          if (cancelledByUserRef.current) return
          if (!receivedAny) {
            console.warn('⏱️ No SSE received, falling back to non-streaming API')
            try { controller.abort() } catch {}
            try {
              const resp = await axios.post(`${API_BASE_URL}/api/ocr`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
              const resultData = resp.data.data
              setResult({
                text: (resultData?.output_format || selectedFormat) === 'rec' ? '' : (resultData?.text || ''),
                mode: resultData?.mode || selectedMode,
                output_format: resultData?.output_format || selectedFormat,
                prompt_used: resultData?.prompt_used || '',
                timestamp: resultData?.timestamp || '',
                streaming: false,
                singleImageUrl: resultData?.image_urls?.[0] || null
              })
            } catch (e) {
              console.error('❌ Fallback request failed:', e)
              setError(e.response?.data?.detail || t('defaultProcessingError'))
            } finally {
              setLoading(false)
            }
          }
        }, fallbackMs)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const evt of events) {
            if (cancelled) break
            const lines = evt.split('\n')
            const dataLine = lines.find(l => l.startsWith('data:'))
            if (!dataLine) continue
            const jsonStr = dataLine.slice(5).trim()
            if (!jsonStr) continue
            try {
              const data = JSON.parse(jsonStr)
              console.log('📥 Stream data:', data)
              receivedAny = true
              if (!fallbackCleared) { try { clearTimeout(fallbackTimer) } catch {} fallbackCleared = true }
              if (data.type === 'start') {
                console.log('▶️ Stream started')
                const initialResult = {
                  text: '',
                  mode: selectedMode,
                  output_format: selectedFormat,
                  streaming: true,
                  start_time: data.start_time
                }
                if (selectedFormat !== 'rec') {
                  initialResult.pages = []
                }
                setResult(initialResult)
                setCurrentJobId(data.job_id || null)
                setIsCancelling(false)
              } else if (data.type === 'chunk') {
                const chunkText = data.text || ''
                const isRecMode = selectedFormat === 'rec'
                // 如果有page信息，说明是PDF多页
                if (data.page !== undefined) {
                  console.log(`📄 Received page ${data.page}/${data.total}, text length: ${chunkText.length}, image: ${data.image_url ? 'YES' : 'NO'}`)
                  
                  // 添加页面标题分隔
                  const headerLabel = t('pageLabel', data.page)
                  const pageHeader = `\n\n--- ${headerLabel} ---\n\n`
                  accumulatedText += pageHeader + chunkText
                  
                  const pageInfo = { 
                    page: data.page, 
                    total: data.total, 
                    text: chunkText,
                    imageUrl: data.image_url || null  // 带框图片URL
                  }
                  pageResults.push(pageInfo)
                  
                  setResult(prev => ({ 
                    ...(prev||{}), 
                    text: accumulatedText, 
                    mode: selectedMode, 
                    output_format: selectedFormat, 
                    streaming: true,
                    pages: [...pageResults],  // 创建新数组触发更新
                    currentPage: data.page,
                    totalPages: data.total
                  }))
                  
                  console.log(`✅ Page ${data.page} displayed, total pages: ${pageResults.length}`)
                } else {
                  if (isRecMode) {
                    if (data.image_url) {
                      setResult(prev => ({
                        ...(prev || {}),
                        text: '',
                        mode: selectedMode,
                        output_format: selectedFormat,
                        streaming: true,
                        singleImageUrl: data.image_url
                      }))
                    }
                    continue
                  }
                  // 单图或其他流式输出
                  accumulatedText += chunkText
                  setResult(prev => ({ 
                    ...(prev||{}), 
                    text: accumulatedText, 
                    mode: selectedMode, 
                    output_format: selectedFormat, 
                    streaming: true,
                    singleImageUrl: data.image_url || prev?.singleImageUrl  // 保存单图的带框图片
                  }))
                }
              } else if (data.type === 'metadata') {
                metadata = data
                if (selectedFormat === 'rec' && Array.isArray(data.image_urls) && data.image_urls.length > 0) {
                  setResult(prev => ({
                    ...(prev || {}),
                    text: '',
                    mode: selectedMode,
                    output_format: selectedFormat,
                    singleImageUrl: prev?.singleImageUrl || data.image_urls[0],
                    streaming: prev?.streaming ?? false
                  }))
                }
              } else if (data.type === 'done') {
                if (!fallbackCleared) { try { clearTimeout(fallbackTimer) } catch {} fallbackCleared = true }
                setResult(prev => {
                  const finalText = accumulatedText || prev?.text || ''
                  const finalResult = {
                    text: finalText,
                    mode: metadata.mode || selectedMode,
                    output_format: metadata.output_format || selectedFormat,
                    prompt_used: metadata.prompt_used || '',
                    timestamp: metadata.timestamp || '',
                    start_time: metadata.start_time || undefined,
                    duration_ms: data.duration_ms || metadata.duration_ms,
                    streaming: false,
                    // 保留之前的pages和singleImageUrl
                    singleImageUrl: prev?.singleImageUrl
                  }
                  const hasPageResults = pageResults.length > 0
                  if (hasPageResults) {
                    finalResult.pages = [...pageResults]
                  } else if (Array.isArray(prev?.pages) && prev.pages.length > 0) {
                    finalResult.pages = [...prev.pages]
                  } else {
                    finalResult.pages = undefined
                  }
                  const imageUrlsFromMeta = Array.isArray(metadata.image_urls) ? metadata.image_urls : []
                  if (!finalResult.singleImageUrl && imageUrlsFromMeta.length > 0) {
                    finalResult.singleImageUrl = imageUrlsFromMeta[0]
                  }
                  if (finalResult.output_format === 'rec') {
                    finalResult.text = ''
                  }
                  console.log('✅ Final result set:', finalResult)
                  console.log('✅ Final text length:', finalResult.text?.length)
                  console.log('✅ accumulatedText length:', accumulatedText?.length)
                  console.log('✅ prev?.text length:', prev?.text?.length)
                  
                  // 识别完成提示 - 优雅的toast
                  setShowSuccessToast(true)
                  setTimeout(() => setShowSuccessToast(false), 3000)
                  
                  return finalResult
                })
                setLoading(false)
                setCurrentJobId(null)
                try { if (timerRef.current) clearInterval(timerRef.current) } catch {}
                setStreamCtrl(null)
                setIsCancelling(false)
                cancelledByUserRef.current = false
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Stream error')
              } else if (data.type === 'cancelled') {
                console.log('⛔ Stream cancelled')
                cancelled = true
                cancelledByUserRef.current = false
                setLoading(false)
                setCurrentJobId(null)
                setIsCancelling(false)
                setStreamCtrl(null)
                try { if (fallbackTimer) clearTimeout(fallbackTimer) } catch {}
                try { if (timerRef.current) clearInterval(timerRef.current) } catch {}
                setError(t('cancelNotice'))
                setResult(null)
                break
              }
            } catch (e) {
              console.error('⚠️ Failed to parse SSE data:', e, 'Raw:', jsonStr)
            }
          }
          if (cancelled) break
        }
      } catch (err) {
        if (cancelledByUserRef.current || err?.name === 'AbortError') {
          console.log('⚠️ Streaming aborted by user request')
          cancelledByUserRef.current = false
          setLoading(false)
          setStreamCtrl(null)
          setIsCancelling(false)
          setCurrentJobId(null)
          setResult(null)
          return
        }
        console.error('❌ Streaming OCR failed:', err)
        const errorMsg = err.message || t('defaultStreamingError')
        alert(t('alertStreamingFailed', errorMsg))
        setError(errorMsg)
        setLoading(false)
        try { if (timerRef.current) clearInterval(timerRef.current) } catch {}
        setStreamCtrl(null)
        setCurrentJobId(null)
        setResult(null)
      }
    } else {
      // 传统方式（非流式）
      try {
        console.log('🚀 Sending OCR request...')
        const response = await axios.post(`${API_BASE_URL}/api/ocr`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        console.log('✅ Response received:', response)
        console.log('📦 Response data:', response.data)
        console.log('📄 Result data:', response.data.data)
        console.log('📝 Text content:', response.data.data?.text)
        console.log('📏 Text length:', response.data.data?.text?.length)
        
        const resultData = response.data.data
        
        // 强制更新
        if (resultData && typeof resultData.text === 'string') {
          const outputFormat = resultData.output_format || selectedFormat
          const newResult = {
            text: outputFormat === 'rec' ? '' : resultData.text,
            mode: resultData.mode || selectedMode,
            output_format: outputFormat,
            prompt_used: resultData.prompt_used || '',
            timestamp: resultData.timestamp || '',
            duration_ms: resultData.duration_ms,
            singleImageUrl: resultData.image_urls?.[0] || null
          }
          console.log('🎯 Setting result:', newResult)
          console.log('🎯 Result text preview:', newResult.text.substring(0, 200))
          setResult(newResult)
          
          // 验证state是否更新
          setTimeout(() => {
            console.log('🔍 Checking if result updated...')
          }, 100)
        } else {
          console.error('❌ No text in response!')
          alert(t('alertEmptyResponse'))
        }
      } catch (err) {
        console.error('❌ OCR request failed:', err)
        console.error('Response data:', err.response?.data)
        const errorMsg = err.response?.data?.detail || t('defaultProcessingError')
        alert(t('alertStreamingFailed', errorMsg))
        setError(errorMsg)
      } finally {
        setLoading(false)
        try { if (timerRef.current) clearInterval(timerRef.current) } catch {}
      }
    }
  }

  const handleCancel = async () => {
    if (!loading || isCancelling) return
    cancelledByUserRef.current = true
    setIsCancelling(true)
    try {
      if (streamCtrl) {
        try { streamCtrl.abort() } catch (e) { console.warn('⚠️ Abort controller error:', e) }
      }
      if (currentJobId) {
        await fetch(`${API_BASE_URL}/api/ocr/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: currentJobId })
        }).catch(err => {
          console.error('❌ Cancel request failed:', err)
        })
      }
    } finally {
      setIsCancelling(false)
    }
  }

  const closePreview = () => {
    // 停止流式请求（若仍在进行）
    try { if (streamCtrl) streamCtrl.abort() } catch {}
    setStreamCtrl(null)
    // 停止计时
    try { if (timerRef.current) clearInterval(timerRef.current) } catch {}
    // 释放PDF URL
    try { if (runPreview?.type === 'pdf' && runPreview?.url) URL.revokeObjectURL(runPreview.url) } catch {}
    setRunPreview(null)
    setShowPreview(false)
  }

  const handleDownloadImage = (relativeUrl, filename = `ocr_result_${Date.now()}.jpg`) => {
    if (!relativeUrl) return
    const url = relativeUrl.startsWith('http') ? relativeUrl : `${API_BASE_URL}${relativeUrl}`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopy = (e) => {
    console.log('🟢 handleCopy 函数被调用！')
    e?.preventDefault?.()
    e?.stopPropagation?.()
    
    console.log('🔍 result:', result)
    console.log('🔍 result?.text:', result?.text)
    console.log('🔍 text length:', result?.text?.length)
    
    const textToCopy = displayText
    
    if (!textToCopy) {
      console.warn('⚠️ No text to copy')
      alert(t('alertNoTextToCopy'))
      return
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        console.log('✅ 复制成功')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(err => {
        console.error('❌ Copy failed:', err)
        alert(t('alertCopyFailed', err.message))
      })
  }

  const handleExport = (e) => {
    console.log('🟢 handleExport 函数被调用！')
    e?.preventDefault?.()
    e?.stopPropagation?.()
    
    console.log('🔍 result:', result)
    console.log('🔍 result?.text:', result?.text)
    
    const textToExport = displayText
    
    if (!textToExport) {
      console.warn('⚠️ No text to export')
      alert(t('alertNoTextToExport'))
      return
    }
    
    try {
      const ext = result?.output_format === 'markdown' ? 'md' : 'txt'
      const filename = `ocr_result_${result?.timestamp || Date.now()}.${ext}`
      
      const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('✅ Export successful:', filename)
    } catch (err) {
      console.error('❌ Export failed:', err)
      alert(t('alertExportFailed', err.message))
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Header
        backendAvailable={backendAvailable}
        language={language}
        onLanguageChange={setLanguage}
        labels={headerLabels}
      />

      <div className="container mx-auto px-6 py-6 max-w-7xl flex-1 flex flex-col min-h-0">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch h-full flex-1 min-h-0">
          
          {/* Left Column - Upload/Preview and Settings */}
          <div className="space-y-4 h-full flex flex-col lg:self-stretch min-h-0 lg:overflow-y-auto lg:pr-2">
            {/* Upload Section OR Preview Section */}
            <div className="glass-effect rounded-2xl p-5 card-shadow">
              {!showPreview ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                      <Upload className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-base font-semibold text-white">{t('uploadSectionTitle')}</h2>
                  </div>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                      dragActive ? 'border-primary bg-primary/10' :
                      selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' :
                      'border-white/10 hover:border-primary/50 hover:bg-white/5'
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
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div 
                          className="relative w-full h-28 bg-dark-lighter rounded-lg overflow-hidden cursor-pointer group"
                          onDoubleClick={handlePreviewClick}
                          onClick={(e) => e.stopPropagation()}
                          title={t('doubleClickHint')}
                        >
                          {filePreview && filePreview !== 'pdf' ? (
                            <img src={filePreview} alt="Preview" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                          ) : filePreview === 'pdf' ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                </svg>
                                <p className="text-white text-xs font-medium">{t('pdfFileLabel')}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-xs font-medium">{t('doubleClickHint')}</p>
                          </div>
                        </div>
                        <div className="text-left px-1">
                        <p className="text-white font-medium text-sm truncate">{selectedFile.name}</p>
                        <p className="text-gray-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFilePreview(null) }}
                          className="w-full px-3 py-1.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-lg transition-all text-xs font-medium"
                        >{t('reselectButton')}</button>
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-white font-medium text-xs mb-1">{t('dropHintTitle')}</p>
                        <p className="text-gray-400 text-xs">{t('dropHintSubtitle')}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-white">{t('previewTitle')}</h2>
                    <div className="flex items-center gap-3">
                      <button onClick={closePreview} className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300 hover:text-white">{t('closePreview')}</button>
                    </div>
                  </div>
                  <div className="bg-dark-lighter rounded-lg border border-white/10 overflow-hidden" style={{
                    height: runPreview?.type === 'pdf' ? '75vh' : (previewSize.height > 0 ? `${Math.min(previewSize.height + 40, window.innerHeight * 0.75)}px` : '75vh')
                  }}>
                    {runPreview?.url ? (
                      runPreview.type === 'image' ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <img src={runPreview.url} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <iframe title="doc-preview" src={runPreview.url} className="w-full h-full" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">{t('noPreviewText')}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Settings - 在预览时隐藏 */}
            {!showPreview && (
            <div className="glass-effect rounded-2xl p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-secondary/20 rounded-lg">
                  <Settings className="w-4 h-4 text-secondary" />
                </div>
                <h2 className="text-base font-semibold text-white">{t('configSectionTitle')}</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">{t('modeLabel')}</label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-lighter border border-white/10 rounded-lg text-white text-sm cursor-pointer hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  >
                    {configs.modes.map((mode) => (
                      <option key={mode.value} value={mode.value}>{getModeLabel(mode)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">{t('formatLabel')}</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-lighter border border-white/10 rounded-lg text-white text-sm cursor-pointer hover:border-accent/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                  >
                    {configs.output_formats.map((format) => (
                      <option key={format.value} value={format.value}>{format.icon} {getFormatLabel(format)}</option>
                    ))}
                  </select>
                  {/* 显示格式说明 */}
                  {(() => {
                    const currentFormat = currentFormatConfig
                    const desc = getFormatDescription(currentFormat)
                    return desc && (
                      <p className="text-xs text-gray-500 mt-1.5">💡 {desc}</p>
                    )
                  })()}
                </div>

                {/* 条件显示输入框 - 根据 input_type 决定 */}
                {(() => {
                  const currentFormat = currentFormatConfig
                  const inputType = currentFormat?.input_type || 'optional'
                  
                  // input_type === 'none': 不显示输入框（如 general）
                  if (inputType === 'none') return null
                  
                  // input_type === 'required': 必填输入框（如 rec）
                  const isRequired = inputType === 'required'
                  const label = isRequired ? t('promptLabelRequired') : t('promptLabelOptional')
                  const placeholder = getFormatPlaceholder(currentFormat) || (language === 'en' ? 'Leave empty to use the default prompt…' : '留空使用默认提示词…')
                  
                  return (
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">
                        {label}
                        {isRequired && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full px-3 py-2 bg-dark-lighter border rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 transition-all resize-none ${
                          isRequired 
                            ? 'border-amber-500/30 focus:border-amber-500 focus:ring-amber-500/20' 
                            : 'border-white/10 focus:border-primary focus:ring-primary/20'
                        }`}
                        rows={2}
                      />
                      {isRequired && !customPrompt.trim() && (
                        <p className="text-xs text-amber-400 mt-1.5">⚠️ {t('promptRequiredWarning')}</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
            )}

            {/* 左侧底部原文预览已移除，仅保留上方预览 */}

            {/* Submit Button - 移到左侧底部 */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary via-secondary to-accent text-white text-base font-semibold rounded-xl hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('processingButton')}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  <span>{t('startButton')}</span>
                </>
              )}
            </button>

            {loading && (
              <button
                onClick={handleCancel}
                type="button"
                className="w-full py-3 px-6 bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                disabled={isCancelling}
              >
                {isCancelling ? t('cancellingButton') : t('cancelButton')}
              </button>
            )}

          </div>

          {/* Right Column - Result (统一加载与输出区域) */}
          <div className="space-y-4 h-full flex flex-col lg:self-stretch min-h-0 lg:overflow-y-auto lg:pl-2">
            {/* 缩略图区域 - 独立显示在结果框上方 */}
            {result?.pages && result.pages.length > 0 && (
              <div className="glass-effect rounded-2xl p-5 card-shadow animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">
                    {t('pagePreviewTitle')} (
                      {result.streaming
                        ? t('thumbnailsProcessingLabel', result.pages.length)
                        : language === 'en'
                          ? `${result.pages.length} page${result.pages.length === 1 ? '' : 's'}`
                          : `共${result.pages.length}页`
                      }
                    )
                  </p>
                  {result.pages.length > 8 && (
                    <button
                      onClick={() => setShowAllThumbnails(!showAllThumbnails)}
                      className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded border border-white/10 transition-all"
                    >
                      {showAllThumbnails ? t('collapseAll') : t('viewAll', result.pages.length)}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(showAllThumbnails ? result.pages : result.pages.slice(0, 8)).map((page, idx) => (
                    <div 
                      key={idx} 
                      className="bg-dark/50 rounded border border-white/5 p-2 hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => page.imageUrl && setPreviewImageModal({ url: `http://localhost:8000${page.imageUrl}`, title: t('pageLabel', page.page) })}
                    >
                      <div className="aspect-square mb-2 bg-dark rounded border border-white/10 overflow-hidden">
                        {page.imageUrl ? (
                          <img 
                            src={`http://localhost:8000${page.imageUrl}`}
                            alt={`Page ${page.page}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-300 font-medium">{t('pageLabel', page.page)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* rec模式：大图显示区域 */}
            {result?.output_format === 'rec' && result?.singleImageUrl && !result?.pages && (
              <div className="glass-effect rounded-2xl p-5 card-shadow animate-fade-in flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <h2 className="text-base font-semibold text-white">
                      {t('recResultTitle')}
                      {result?.streaming ? getStreamingTimeLabel(elapsedMs) : getDurationLabel(result?.duration_ms)}
                    </h2>
                  </div>
                  <button
                    type="button"
                    disabled={!result?.singleImageUrl}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => handleDownloadImage(result.singleImageUrl, `rec_result_${result.timestamp || Date.now()}.jpg`)}
                  >
                    {t('downloadImage')}
                  </button>
                </div>
                <div className="bg-dark-lighter rounded-lg p-4 border border-white/5 flex-1 flex flex-col items-center justify-center">
                  <img 
                    src={`http://localhost:8000${result.singleImageUrl}`}
                    alt={t('recResultTitle')}
                    className="w-full max-h-[420px] object-contain rounded border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImageModal({ url: `http://localhost:8000${result.singleImageUrl}`, title: t('recResultTitle') })}
                  />
                  <p className="text-gray-400 text-xs mt-3 self-start">{t('recResultHint')}</p>
                </div>
                {result && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <p className="text-primary text-xs mb-0.5">{t('recInfoMode')}</p>
                      <p className="text-white font-medium text-sm">{result.mode}</p>
                    </div>
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                      <p className="text-accent text-xs mb-0.5">{t('recInfoFormat')}</p>
                      <p className="text-white font-medium text-sm">{getFormatLabel(getFormatByValue(result.output_format))}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 非rec模式：单图预览（缩略图） */}
            {result?.output_format !== 'rec' && result?.singleImageUrl && !result?.pages && (
              <div className="glass-effect rounded-2xl p-5 card-shadow animate-fade-in">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <p className="text-sm font-semibold text-white">{t('singleImagePreviewTitle')}</p>
                  <button
                    type="button"
                    disabled={!result?.singleImageUrl}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => handleDownloadImage(result.singleImageUrl, `ocr_result_${result.timestamp || Date.now()}.jpg`)}
                  >
                    {t('downloadImage')}
                  </button>
                </div>
                <img 
                  src={`http://localhost:8000${result.singleImageUrl}`}
                  alt="Result with boxes"
                  className="w-full max-h-56 object-contain rounded border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreviewImageModal({ url: `http://localhost:8000${result.singleImageUrl}`, title: t('resultModalTitle') })}
                />
              </div>
            )}

            {/* Result Display - 文本结果区域（非rec模式才显示） */}
            {(loading || result) && result?.output_format !== 'rec' && (
              <div className="glass-effect rounded-2xl p-5 card-shadow animate-fade-in flex flex-col flex-1 min-h-0 lg:min-h-[420px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h2 className="text-base font-semibold text-white">
                      {t('recognitionResultTitle')} ({getCharacterCountLabel(displayText.length)})
                      {result?.streaming ? getStreamingTimeLabel(elapsedMs) : getDurationLabel(result?.duration_ms)}
                    </h2>
                    {result?.streaming && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full animate-pulse">
                        {result.currentPage ? (language === 'en' ? `Processing ${result.currentPage}/${result.totalPages}` : `处理中 ${result.currentPage}/${result.totalPages}页`) : t('liveUpdating')}
                      </span>
                    )}
                  </div>
                  {displayText.length === 0 ? (
                    <div className="text-xs text-gray-500">{t('waitingForResult')}</div>
                  ) : (
                    <div className="flex items-center gap-2" style={{position: 'relative', zIndex: 10}}>
                      <button
                        onClick={handleCopy}
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                          'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? t('copiedButton') : t('copyButton')}
                      </button>
                      <button
                        onClick={handleExport}
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('exportButton')}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-dark-lighter rounded-lg p-4 border border-white/5 overflow-y-auto scrollbar-custom flex-1 min-h-0 max-h-[60vh] lg:max-h-[55vh]">
                  {loading && displayText.length === 0 ? (
                    <div className="w-full py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-white text-xs">{t('loadingText')}</p>
                    </div>
                  ) : (
                    <>
                      {/* 完整文本结果 - 强制使用markdown渲染 */}
                      <div className="text-gray-200 text-sm prose prose-invert prose-sm max-w-none prose-table:border prose-table:border-white/20 prose-th:border prose-th:border-white/20 prose-td:border prose-td:border-white/20 prose-headings:text-white prose-h1:text-xl prose-h2:text-lg prose-h3:text-base">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {displayText}
                        </ReactMarkdown>
                      </div>
                    </>
                  )}
                </div>
                
                {result && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <p className="text-primary text-xs mb-0.5">{t('recInfoMode')}</p>
                      <p className="text-white font-medium text-sm">{result.mode}</p>
                    </div>
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                      <p className="text-accent text-xs mb-0.5">{t('recInfoFormat')}</p>
                      <p className="text-white font-medium text-sm">{getFormatLabel(getFormatByValue(result.output_format))}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* rec模式加载中状态 */}
            {loading && selectedFormat === 'rec' && !result && (
              <div className="glass-effect rounded-2xl p-12 text-center border border-white/5 animate-fade-in">
                <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-white text-base font-medium mb-2">{t('recLoadingTitle')}</p>
                <p className="text-gray-400 text-xs">{t('recLoadingSubtitle')}</p>
              </div>
            )}

            {/* Placeholder when no result */}
            {!result && !error && !loading && (
              <div className="glass-effect rounded-2xl p-12 text-center border border-white/5">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-primary/50" />
                </div>
                <p className="text-gray-400 text-base font-medium mb-2">{t('placeholderHeading')}</p>
                <p className="text-gray-500 text-xs">{t('placeholderBody')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图片预览弹窗 */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setPreviewImageModal(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all"
              >
                {t('modalClose')}
              </button>
            </div>
            <div className="flex items-center justify-center h-full">
              <img 
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {previewImageModal.title}
            </p>
          </div>
        </div>
      )}

      {/* 识别完成提示 Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 right-6 z-[100] animate-fade-in">
          <div className={`backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
            result?.output_format === 'rec' 
              ? 'bg-amber-500/90 border-amber-400/30' 
              : 'bg-emerald-500/90 border-emerald-400/30'
          }`}>
            <Check className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                {result?.output_format === 'rec' ? t('toastRecComplete') : t('toastOcrComplete')}
              </p>
              <p className="text-xs opacity-90">
                {t('toastDuration', typeof result?.duration_ms === 'number' ? (result.duration_ms / 1000).toFixed(2) : '0')}
                {result?.output_format !== 'rec' && ` · ${t('toastCharacters', displayText.length)}`}
                {result?.output_format === 'rec' && ` · ${t('toastImageReady')}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-dark/30 backdrop-blur-lg mt-12">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* About */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">{t('footerAboutTitle')}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {t('footerAboutBody')}
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">{t('footerLinksTitle')}</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://github.com/deepseek-ai/DeepSeek-OCR" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    {t('footerLinkGithub')}
                  </a>
                </li>
                <li>
                  <a href="https://huggingface.co/deepseek-ai/DeepSeek-OCR" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    {t('footerLinkModel')}
                  </a>
                </li>
                <li>
                  <a href="https://www.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    {t('footerLinkWebsite')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">{t('footerTeamTitle')}</h3>
              <p className="text-gray-400 text-xs mb-2">{t('footerTeamName')}</p>
              <p className="text-gray-500 text-xs">{t('footerTeamDescription')}</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-gray-500 text-xs">{t('footerCopyright')}</p>
              <p className="text-gray-500 text-xs">
                Powered by <span className="text-primary font-medium">DeepSeek-OCR</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
