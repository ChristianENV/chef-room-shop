'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { TopToolbar, ViewportControls, BottomActionBar } from './toolbar'

// Dynamic import for 3D viewport to avoid SSR issues
const Viewport3D = dynamic(() => import('./viewport-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
      <div className="text-muted-foreground">Cargando visor 3D...</div>
    </div>
  ),
})

export function DesignerLayout() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background">
      {/* Left Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 hidden h-full md:block"
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
        className="relative z-10 hidden h-full xl:block"
      >
        <RightSidebar />
      </motion.div>
    </div>
  )
}
