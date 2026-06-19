'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type AdminJsonViewerTab = {
  id: string
  label: string
  value: unknown
  loading?: boolean
  emptyMessage?: string
}

type AdminJsonViewerProps = {
  tabs: AdminJsonViewerTab[]
  title?: string
  className?: string
  onOpenChange?: (open: boolean) => void
}

function hasJsonValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>).length > 0
  }
  return true
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/** Admin-only collapsible JSON viewer with tabs and clipboard copy. */
export function AdminJsonViewer({
  tabs,
  title = 'JSON de auditoría',
  className,
  onOpenChange,
}: AdminJsonViewerProps) {
  const [open, setOpen] = useState(false)
  const [copiedTabId, setCopiedTabId] = useState<string | null>(null)

  const visibleTabs = useMemo(
    () => tabs.filter((tab) => tab.loading || hasJsonValue(tab.value) || tab.emptyMessage),
    [tabs],
  )

  const defaultTab = visibleTabs[0]?.id

  if (visibleTabs.length === 0) return null

  const copyTab = async (tab: AdminJsonViewerTab) => {
    if (!hasJsonValue(tab.value)) return
    await navigator.clipboard.writeText(formatJson(tab.value))
    setCopiedTabId(tab.id)
    window.setTimeout(() => setCopiedTabId(null), 2000)
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        onOpenChange?.(next)
      }}
      className={cn('rounded-lg border border-border/60 bg-card/40', className)}
      data-testid="admin-json-viewer"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/40"
        >
          <span>{title}</span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border/60">
        <Tabs defaultValue={defaultTab} className="p-3">
          <TabsList className="mb-3 h-auto flex-wrap justify-start gap-1">
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {visibleTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-2">
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!hasJsonValue(tab.value) || tab.loading}
                  onClick={() => void copyTab(tab)}
                >
                  {copiedTabId === tab.id ? (
                    <>
                      <Check className="mr-2 size-3.5" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-3.5" />
                      Copiar JSON
                    </>
                  )}
                </Button>
              </div>
              {tab.loading ? (
                <p className="font-serif text-sm text-muted-foreground">Cargando JSON…</p>
              ) : hasJsonValue(tab.value) ? (
                <pre className="max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                  {formatJson(tab.value)}
                </pre>
              ) : (
                <p className="font-serif text-sm text-muted-foreground">
                  {tab.emptyMessage ?? 'Sin datos disponibles.'}
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  )
}
