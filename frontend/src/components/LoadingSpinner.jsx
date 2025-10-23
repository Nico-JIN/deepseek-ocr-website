import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ text = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-gray-300">{text}</p>
    </div>
  )
}

export default LoadingSpinner
