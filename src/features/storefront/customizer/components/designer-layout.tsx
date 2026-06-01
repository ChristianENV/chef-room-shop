'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import LeftSidebar from '@/components/left-sidebar'
import RightSidebar from '@/components/right-sidebar'
import { TopToolbar, ViewportControls, BottomActionBar } from '@/components/toolbar'

// Dynamic import for 3D viewport to avoid SSR issues
const Viewport3D = dynamic(() => import('@/components/viewport-3d'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
      <div className="text-muted-foreground">Loading 3D Viewport...</div>
    </div>
  )
})

export default function DesignerLayout() {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 h-full"
      >
        <LeftSidebar />
      </motion.div>

      {/* Main viewport area */}
      <div className="relative flex-1">
        {/* Top toolbar */}
        <TopToolbar />
        
        {/* 3D Viewport */}
        <div className="h-full w-full">
          <Viewport3D />
        </div>
        
        {/* Viewport controls */}
        <ViewportControls />
        
        {/* Bottom action bar */}
        <BottomActionBar />
      </div>

      {/* Right Sidebar */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 h-full"
      >
        <RightSidebar />
      </motion.div>
    </div>
  )
}
