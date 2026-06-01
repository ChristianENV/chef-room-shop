'use client'

import { motion } from 'framer-motion'
import { 
  Undo2,
  Redo2,
  Share2,
  Download,
  Save,
  Maximize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Scan,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDesignerStore } from '@/lib/store'
import { cn } from '@/lib/utils'

function ToolbarButton({ 
  icon: Icon, 
  label, 
  onClick,
  variant = 'ghost'
}: { 
  icon: typeof Undo2
  label?: string
  onClick?: () => void
  variant?: 'ghost' | 'default'
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        variant === 'ghost' 
          ? "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      <Icon className="size-4" />
      {label && <span>{label}</span>}
    </motion.button>
  )
}

export function TopToolbar() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
    >
      {/* Spacer */}
      <div className="w-48" />

      {/* Center controls */}
      <div className="flex items-center gap-2">
        <div className="glass flex items-center gap-1 rounded-xl px-2 py-1">
          <ToolbarButton icon={Undo2} />
          <ToolbarButton icon={Redo2} />
        </div>
        
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-1.5">
          <div className="size-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Guardado automaticamente</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary/50"
        >
          <Save className="size-4" />
          Guardar diseno
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary/50"
        >
          <Share2 className="size-4" />
          Compartir
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Download className="size-4" />
          Agregar al carrito
        </motion.button>
      </div>
    </motion.div>
  )
}

export function ViewportControls() {
  const { viewMode, setViewMode, viewAngle, setViewAngle } = useDesignerStore()

  return (
    <>
      {/* View mode toggle */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute top-20 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="glass flex items-center gap-1 rounded-xl p-1">
          <button
            onClick={() => setViewMode('2D')}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
              viewMode === '2D' 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
              viewMode === '3D' 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            3D
          </button>
          <button className="rounded-lg px-2 py-1.5 text-muted-foreground hover:text-foreground">
            <Scan className="size-4" />
          </button>
        </div>
      </motion.div>

      {/* Bottom viewport controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="glass flex items-center gap-2 rounded-xl px-4 py-2">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <RotateCcw className="size-4" />
            Rotar
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <ZoomIn className="size-4" />
            Acercar
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <ZoomOut className="size-4" />
            Alejar
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <Maximize className="size-4" />
            Panoramica
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <RefreshCw className="size-4" />
            Reset
          </button>
        </div>
      </motion.div>

      {/* View angle toggle */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-24 right-24 z-20"
      >
        <button
          onClick={() => setViewAngle(viewAngle === 'front' ? 'back' : 'front')}
          className="glass flex flex-col items-center gap-1 rounded-xl p-3 transition-all hover:bg-secondary/50"
        >
          <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/50">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-foreground">
              <rect x="8" y="4" width="16" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="4" y="8" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="22" y="8" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="text-xs text-muted-foreground">
            Vista {viewAngle === 'front' ? 'trasera' : 'frontal'}
          </span>
        </button>
      </motion.div>
    </>
  )
}

export function BottomActionBar() {
  const { size } = useDesignerStore()

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="absolute bottom-0 left-0 right-0 z-20"
    >
      <div className="glass mx-auto flex max-w-2xl items-center justify-between rounded-t-2xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Producto</div>
            <div className="text-sm font-semibold">Filipina Clasica</div>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div>
            <div className="text-xs text-muted-foreground">Talla</div>
            <div className="text-sm font-semibold">{size}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Precio</div>
            <div className="text-lg font-bold text-primary">$89.00 USD</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/50 bg-secondary/30">
              <button className="px-3 py-2 text-muted-foreground hover:text-foreground">-</button>
              <span className="w-8 text-center text-sm font-medium">1</span>
              <button className="px-3 py-2 text-muted-foreground hover:text-foreground">+</button>
            </div>
            
            <Button size="lg" className="rounded-xl px-6 font-semibold">
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
