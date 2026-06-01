'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  Type, 
  Image, 
  User,
  Star,
  FolderOpen,
  ChevronDown,
  ChevronLeft,
  Check
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useDesignerStore, type CollarStyle, type SleeveStyle, type ButtonStyle, type Size } from '@/lib/store'

const navItems = [
  { id: 'producto', icon: FolderOpen, label: 'Producto' },
  { id: 'colores', icon: Palette, label: 'Colores' },
  { id: 'texto', icon: Type, label: 'Texto' },
  { id: 'logotipos', icon: Image, label: 'Logotipos' },
  { id: 'nombres', icon: User, label: 'Nombres' },
  { id: 'extras', icon: Star, label: 'Extras' },
  { id: 'mis-disenos', icon: FolderOpen, label: 'Mis diseños' },
]

const baseColors = [
  '#FFFFFF', '#1a1a1a', '#E5E5E5', '#3B82F6', '#EF4444',
  '#22C55E', '#F97316', '#A3A3A3', '#D4A574', '#FFD700',
]

const detailColors = [
  '#1a1a1a', '#FFFFFF', '#E5E5E5', '#3B82F6', '#EF4444',
]

const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, subtitle, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/30"
      >
        <div className="text-left">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        <ChevronDown 
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative size-9 rounded-full border-2 transition-all",
        selected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
      )}
      style={{ backgroundColor: color }}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check className={cn(
            "size-4",
            color === '#FFFFFF' || color === '#E5E5E5' || color === '#FFD700' ? "text-black" : "text-white"
          )} />
        </motion.div>
      )}
    </motion.button>
  )
}

function StyleOption({ 
  icon, 
  label, 
  selected, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  selected: boolean
  onClick: () => void 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
        selected 
          ? "border-primary bg-primary/10 text-foreground" 
          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-muted-foreground/50 hover:bg-secondary/50"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  )
}

function SizeButton({ size, selected, onClick }: { size: Size; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-all",
        selected 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {size}
    </motion.button>
  )
}

// Sleeve icons
function SleeveIcon({ type }: { type: SleeveStyle }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-current">
      <rect x="8" y="4" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {type === 'corta' && (
        <>
          <rect x="4" y="6" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="22" y="6" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>
      )}
      {type === '3/4' && (
        <>
          <rect x="4" y="6" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="22" y="6" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>
      )}
      {type === 'larga' && (
        <>
          <rect x="4" y="6" width="6" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="22" y="6" width="6" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>
      )}
    </svg>
  )
}

// Collar icons
function CollarIcon({ type }: { type: CollarStyle }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-current">
      <rect x="8" y="10" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {type === 'mao' && (
        <rect x="10" y="6" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      )}
      {type === 'granjero' && (
        <path d="M10 10 L16 6 L22 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      )}
      {type === 'clasico' && (
        <>
          <path d="M10 10 L8 6 L14 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M22 10 L24 6 L18 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>
      )}
    </svg>
  )
}

// Button style icons
function ButtonIcon({ type }: { type: ButtonStyle }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-current">
      <rect x="10" y="4" width="12" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {type === 'tradicional' && (
        <>
          <circle cx="16" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="16" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>
      )}
      {type === 'ocultos' && (
        <line x1="16" y1="8" x2="16" y2="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      )}
      {type === 'automaticos' && (
        <>
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
          <circle cx="16" cy="18" r="1.5" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

export default function LeftSidebar() {
  const [activeNav, setActiveNav] = useState('producto')
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const {
    baseColor,
    detailColor,
    collarStyle,
    sleeveStyle,
    buttonStyle,
    size,
    setBaseColor,
    setDetailColor,
    setCollarStyle,
    setSleeveStyle,
    setButtonStyle,
    setSize,
  } = useDesignerStore()

  return (
    <div className="flex h-full">
      {/* Icon nav rail */}
      <div className="flex w-16 flex-col items-center gap-1 border-r border-border/30 bg-card/50 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 transition-all",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          )
        })}
        
        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
          >
            <ChevronLeft className={cn("size-5 transition-transform", isCollapsed && "rotate-180")} />
            <span className="text-[10px] font-medium">Colapsar</span>
          </motion.button>
        </div>
      </div>

      {/* Main panel */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col overflow-hidden border-r border-border/30 bg-card/30"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
              <ChevronLeft className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium">Filipina Clasica</div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Configuraciones
                </div>

                <CollapsibleSection title="Colores principales">
                  <div className="flex flex-wrap gap-2">
                    {baseColors.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        selected={baseColor === color}
                        onClick={() => setBaseColor(color)}
                      />
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Colores de detalle" subtitle="Vivos y cuellos">
                  <div className="flex flex-wrap gap-2">
                    {detailColors.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        selected={detailColor === color}
                        onClick={() => setDetailColor(color)}
                      />
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Talla">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {sizes.map((s) => (
                        <SizeButton
                          key={s}
                          size={s}
                          selected={size === s}
                          onClick={() => setSize(s)}
                        />
                      ))}
                    </div>
                    <button className="text-xs text-primary hover:underline">
                      Guia de tallas
                    </button>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Tipo de manga">
                  <div className="grid grid-cols-3 gap-2">
                    <StyleOption
                      icon={<SleeveIcon type="corta" />}
                      label="Corta"
                      selected={sleeveStyle === 'corta'}
                      onClick={() => setSleeveStyle('corta')}
                    />
                    <StyleOption
                      icon={<SleeveIcon type="3/4" />}
                      label="3/4"
                      selected={sleeveStyle === '3/4'}
                      onClick={() => setSleeveStyle('3/4')}
                    />
                    <StyleOption
                      icon={<SleeveIcon type="larga" />}
                      label="Larga"
                      selected={sleeveStyle === 'larga'}
                      onClick={() => setSleeveStyle('larga')}
                    />
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Cuello">
                  <div className="grid grid-cols-3 gap-2">
                    <StyleOption
                      icon={<CollarIcon type="mao" />}
                      label="Mao"
                      selected={collarStyle === 'mao'}
                      onClick={() => setCollarStyle('mao')}
                    />
                    <StyleOption
                      icon={<CollarIcon type="granjero" />}
                      label="Granjero"
                      selected={collarStyle === 'granjero'}
                      onClick={() => setCollarStyle('granjero')}
                    />
                    <StyleOption
                      icon={<CollarIcon type="clasico" />}
                      label="Clasico"
                      selected={collarStyle === 'clasico'}
                      onClick={() => setCollarStyle('clasico')}
                    />
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Botones">
                  <div className="grid grid-cols-3 gap-2">
                    <StyleOption
                      icon={<ButtonIcon type="tradicional" />}
                      label="Tradicional"
                      selected={buttonStyle === 'tradicional'}
                      onClick={() => setButtonStyle('tradicional')}
                    />
                    <StyleOption
                      icon={<ButtonIcon type="ocultos" />}
                      label="Ocultos"
                      selected={buttonStyle === 'ocultos'}
                      onClick={() => setButtonStyle('ocultos')}
                    />
                    <StyleOption
                      icon={<ButtonIcon type="automaticos" />}
                      label="Automaticos"
                      selected={buttonStyle === 'automaticos'}
                      onClick={() => setButtonStyle('automaticos')}
                    />
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
