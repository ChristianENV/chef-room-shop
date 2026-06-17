type HeroEditorialAtmosphereProps = {
  className?: string
}

/**
 * Seamless atmospheric glow for the hero 3D stage.
 * Overscaled radial layers avoid hard edges / boxed panels.
 */
export function HeroEditorialAtmosphere({ className }: HeroEditorialAtmosphereProps) {
  return (
    <div
      className={className}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[155%] w-[175%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(ellipse 48% 46% at 50% 46%, rgba(96, 118, 225, 0.24) 0%, rgba(96, 118, 225, 0.08) 38%, transparent 68%)',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[58%] h-[95%] w-[140%] -translate-x-1/2 -translate-y-1/2 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 58% 52% at 50% 58%, rgba(74, 92, 198, 0.14) 0%, transparent 72%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-12%] left-1/2 h-[52%] w-[130%] -translate-x-1/2 blur-[72px]"
        style={{
          background:
            'radial-gradient(ellipse 62% 58% at 50% 82%, rgba(43, 50, 128, 0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
