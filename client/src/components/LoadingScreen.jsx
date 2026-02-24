import React from 'react'

const LoadingScreen = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-60  flex items-center justify-center h-screen bg-slate-950/20 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500">
      </div>
    </div>
  )
}

export default LoadingScreen