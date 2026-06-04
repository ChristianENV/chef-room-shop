import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  titleClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  titleClassName,
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'max-w-2xl',
        centered && 'mx-auto text-center',
        className,
      )}
    >
      <p className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-primary md:text-[12px]">
        {eyebrow}
      </p>
      <h2
        className={cn(
          'brand-underline mt-5 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]',
          centered && 'brand-underline-center',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-6 font-serif text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed',
            centered && 'mx-auto max-w-xl',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
