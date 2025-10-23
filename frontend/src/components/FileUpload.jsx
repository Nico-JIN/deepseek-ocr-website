import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, ImagePlus } from 'lucide-react'

const FileUpload = ({ selectedFile, onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  return (
    <div className="glass-effect rounded-2xl p-5 shadow-2xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 pb-3 border-b border-white/10">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <Upload className="w-4 h-4" />
        </div>
        <span>上传文件</span>
      </h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
            : selectedFile 
            ? 'border-green-500/50 bg-green-500/10'
            : 'border-gray-600/50 hover:border-cyan-400/50 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                <File className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-white font-medium truncate">{selectedFile.name}</p>
                <p className="text-gray-400 text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFileSelect(null)
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="py-2">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-white font-medium mb-1 text-sm">
              {isDragActive ? '🎯 释放以上传文件' : '拖拽文件到此处或点击上传'}
            </p>
            <p className="text-gray-400 text-xs">
              支持 JPG, PNG, PDF, TIFF, WebP, BMP
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
