import React from 'react'

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#e5e5e6]">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 font-semibold">Yükleniyor...</p>
      </div>
    </div>
  )
}

export default Loading
