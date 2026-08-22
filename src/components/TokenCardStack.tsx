import { ShieldCheck } from 'lucide-react'

type Card = {
  label: string
  num: string
  /* stacking transform — z-depth, vertical offset, horizontal offset */
  transform: string
  /* translucent fill strength; all cards are glass, not gradient fills */
  fill: string
  border: string
  accent: string
  float?: string
}

const CARDS: Card[] = [
  {
    label: 'Live token',
    num: '•••• 9f2b',
    transform: 'translateZ(70px) translateY(-52px) translateX(-22px)',
    fill: 'rgba(13, 148, 136, 0.16)',
    border: 'rgba(94, 234, 212, 0.28)',
    accent: 'text-teal-200',
    float: 'animate-float',
  },
  {
    label: 'Isolated',
    num: '•••• 47ac',
    transform: 'translateZ(35px) translateY(-10px) translateX(0)',
    fill: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.16)',
    accent: 'text-slate-200',
    float: 'animate-float-slow',
  },
  {
    label: 'Contained',
    num: '•••• 0b13',
    transform: 'translateZ(0) translateY(32px) translateX(22px)',
    fill: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: 'text-slate-400',
  },
]

/**
 * Stacked glass payment cards rendered in 3D.
 * `tilt` lets the caller dial the rotation back on tighter layouts.
 */
export default function TokenCardStack({ tilt = 'rotateX(14deg) rotateY(-18deg)' }: { tilt?: string }) {
  return (
    <div className="perspective">
      <div
        className="preserve-3d relative mx-auto h-64 w-[21rem] sm:h-72 sm:w-[24rem]"
        style={{ transform: tilt }}
      >
        {CARDS.map((c) => (
          <div
            key={c.num}
            className={`backface-hidden absolute inset-0 rounded-2xl p-6 ${c.float ?? ''}`}
            style={{
              transform: c.transform,
              background: c.fill,
              border: `1px solid ${c.border}`,
              backdropFilter: 'saturate(1.6) blur(24px)',
              WebkitBackdropFilter: 'saturate(1.6) blur(24px)',
              boxShadow:
                'inset 0 1px 0 0 rgba(255,255,255,0.14), 0 28px 60px -24px rgba(0,0,0,0.85)',
            }}
          >
            <div className="flex items-start justify-between">
              {/* chip */}
              <div className="flex h-9 w-11 items-center justify-center rounded-md border border-white/15 bg-white/10">
                <div className="h-5 w-6 rounded-sm border border-white/20 bg-white/20" />
              </div>
              <ShieldCheck className={`h-5 w-5 ${c.accent}`} />
            </div>

            <div className="mt-7 font-mono text-lg tracking-[0.18em] text-white/95">
              {c.num}
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="eyebrow text-white/40">Status</div>
                <div className="mt-1 text-sm text-white">{c.label}</div>
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                Perimeter
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
