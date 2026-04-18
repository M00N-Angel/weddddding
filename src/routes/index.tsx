/**
 * Wedding Invitation — Oleg & Vlada — 25.07.2026
 *
 * Asset placement guide:
 *   public/audio/background.mp3       — background music file
 *   public/video/wedding.MP4          — wedding video
 *   public/images/page1.jpg           — page 1 background (landscape)
 *   public/images/page1-mobile.jpg    — page 1 mobile background (portrait, optional)
 *   public/images/page2.jpg           — page 2 background
 *   public/images/page2-mobile.jpg    — optional
 *   public/images/page3.jpg           — page 3 background
 *   public/images/page3-mobile.jpg    — optional
 *   src/data/guests.ts                — editable guest list
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import emailjs from '@emailjs/browser'
import guests from '@/data/guests'
import type { GuestFlag } from '@/data/guests'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === 'string' ? search.id : undefined,
  }),
  component: WeddingPage,
})

const EMAILJS_SERVICE_ID = 'service_j75oktw'
const EMAILJS_TEMPLATE_ID = 'template_220bw8b'
const EMAILJS_PUBLIC_KEY = 'lHPA8-iwlbNMsKghs'
const WEDDING_DATE = new Date('2026-07-25T13:00:00')
const MUSIC_VOLUME = 0.45

const RSVP_OPTIONS = [
  'Проведём весь день вместе',
  'Будем только на церемонии',
  'Будем только на банкете',
  'К сожалению, не получится',
]

const MAIN_COLORS = [
  { name: 'молочный', color: '#FFF8F0' },
  { name: 'пастельно-розовый', color: '#FFD1DC' }, 
  { name: 'лавандовый', color: '#BBBBF1' },    
  { name: 'бежевый', color: '#F0E0C8' },
  { name: 'пастельно-голубой', color: '#AED9EA' },
  { name: 'золотой крайола', color: '#E7C697' },
  { name: 'оливковый', color: '#8FAF85' }, 
  { name: 'эвкалипт', color: '#7A9E8E' }, 
]

const ACCENT_COLORS = [
  { name: 'светло-серый', color: '#D8D8D8' },
  { name: 'дымчатый', color: '#B4B4B4' },
  { name: 'бежевый', color: '#F0E0C8' },
  { name: 'латунь', color: '#D39B85' },
]

// Deterministic full-screen stars via LCG
function lcgRand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}
const _rng = lcgRand(20250725)
const FULLSCREEN_STARS: [number, number, number, number, number][] = Array.from({ length: 90 }, () => [
  _rng() * 100,
  _rng() * 100,
  0.5 + _rng() * 1.5,
  0.3 + _rng() * 0.65,
  _rng() * 3,
])

const COUNTDOWN_STARS = [
  [-160, -50], [-80, -70], [0, -80], [80, -70], [160, -50],
  [-180, 0], [180, 0], [-160, 50], [-80, 70], [80, 70], [160, 50],
  [-130, -100], [130, -100], [-50, -110], [50, -110],
] as const

function getTexts(flag: GuestFlag | undefined) {
  const informal = flag === 'male' || flag === 'one'
  return {
    greeting: flag === 'two' ? 'Дорогие' : flag === 'one' ? 'Дорогая' : flag === 'male' ? 'Дорогой' : '',
    forYou: informal ? 'тебя' : 'вас',
    withYou: informal ? 'тобой' : 'вами',
    click: informal ? 'Нажми' : 'Нажмите',
    youSupport: informal ? 'ты поддержишь' : 'вы поддержите',
    Joiing: informal ? 'ты присоединишься' : 'вы присоединитесь',
    Accept: informal ? 'подтверди' : 'подтвердите',
  }
}

function getTimeLeft() {
  const now = new Date()
  const diff = WEDDING_DATE.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function fadeAudio(audio: HTMLAudioElement, targetVol: number, ms = 800): Promise<void> {
  return new Promise(resolve => {
    const startVol = audio.volume
    const steps = 24
    const stepTime = ms / steps
    let step = 0
    const id = setInterval(() => {
      step++
      audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * (step / steps)))
      if (step >= steps) { clearInterval(id); resolve() }
    }, stepTime)
  })
}

// ─── Corner Ornament ──────────────────────────────────────────────────────────

function CornerOrnament({ corner }: { corner: 'tl' | 'tr' | 'br' | 'bl' }) {
  const pos: React.CSSProperties =
    corner === 'tl' ? { top: -1, left: -1 } :
    corner === 'tr' ? { top: -1, right: -1 } :
    corner === 'br' ? { bottom: -1, right: -1 } :
                      { bottom: -1, left: -1 }

  const rot = corner === 'tl' ? 0 : corner === 'tr' ? 90 : corner === 'br' ? 180 : 270

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transform: `rotate(${rot}deg)`,
        ...pos,
      }} aria-hidden="true">
      <line x1="0" y1="0" x2="36" y2="0" stroke="rgba(255,240,200,0.55)" strokeWidth="1" />
      <line x1="0" y1="0" x2="0" y2="36" stroke="rgba(255,240,200,0.55)" strokeWidth="1" />
      <line x1="4" y1="4" x2="28" y2="4" stroke="rgba(255,240,200,0.25)" strokeWidth="0.6" />
      <line x1="4" y1="4" x2="4" y2="28" stroke="rgba(255,240,200,0.25)" strokeWidth="0.6" />
      <path d="M 16 2 Q 10 10 2 16" stroke="rgba(255,240,200,0.4)" strokeWidth="0.8" fill="none" />
      <circle cx="22" cy="1" r="1.2" fill="rgba(255,240,200,0.5)" />
      <circle cx="1" cy="22" r="1.2" fill="rgba(255,240,200,0.5)" />
      <rect x="-2.8" y="-2.8" width="5.6" height="5.6" transform="rotate(45 0 0)" fill="rgba(255,240,200,0.65)" />
    </svg>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [fading, setFading] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setFading(true), 2800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: '#050510',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: fading ? 0 : 1, transition: 'opacity 1s ease-in-out',
      pointerEvents: fading ? 'none' : 'auto', overflow: 'hidden',
    }} onTransitionEnd={fading ? onComplete : undefined}>

      {/* Full-screen twinkling stars */}
      {FULLSCREEN_STARS.map(([x, y, r, opacity, delay], i) => (
        <div key={i} style={{
          position: 'absolute', left: `${x}%`, top: `${y}%`,
          width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
          background: 'white', opacity,
          transform: 'translate(-50%, -50%)',
          animation: `twinkle ${2.6 + (i % 7) * 0.5}s ease-in-out ${delay}s infinite`,
        }} />
      ))}

      {/* Central SVG: moon, comet, sun */}
      <svg viewBox="0 0 400 320"
        style={{ width: 'min(90vw, 400px)', height: 'auto', position: 'relative', zIndex: 1 }}
        aria-hidden="true">
        <defs>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Moon glow: strong neon halo in #bdd0e4, larger spread */}
          <filter id="moon-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feFlood floodColor="#bdd0e4" floodOpacity="0.88" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="halo" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Second pass — tighter inner glow for edge shimmer */}
          <filter id="moon-inner" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#d8eeff" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="halo" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Crescent mask — glow only from the crescent shape, not the void */}
          <mask id="moonCrescentMask">
            <circle r="30" fill="white" />
            <circle r="24" cx="13" cy="-5" fill="black" />
          </mask>
          {/* Sun disc: warm amber, bright centre */}
          <radialGradient id="sunGrad" cx="50%" cy="38%" r="62%">
            <stop offset="0%"   stopColor="#FFFBE8" stopOpacity="1" />
            <stop offset="30%"  stopColor="#FFE040" stopOpacity="1" />
            <stop offset="68%"  stopColor="#FFAA00" stopOpacity="1" />
            <stop offset="100%" stopColor="#CC6E00" stopOpacity="0.9" />
          </radialGradient>
          {/*
            Wave-shaped clip: everything above the wave is cut away.
            The wave crests are at y≈-6 (slightly above 0), troughs at y≈+6.
            We close the path by going down to y=70 and back — this fills
            the region below the wave completely.
          */}
          <clipPath id="bottomHalfClip">
            <path d="M -70 0 Q -52 -6 -35 0 Q -17 6 0 0 Q 17 -6 35 0 Q 52 6 70 0 L 70 70 L -70 70 Z" />
          </clipPath>
          {/* Lemniscate — comet path */}
          <path id="infinityPath"
            d="M 200 155 C 245 82 360 82 360 155 C 360 228 245 228 200 155 C 155 82 40 82 40 155 C 40 228 155 228 200 155 Z" />
        </defs>

        {/* Visible ∞ guide at 40% opacity */}
        <path
          d="M 200 155 C 245 82 360 82 360 155 C 360 228 245 228 200 155 C 155 82 40 82 40 155 C 40 228 155 228 200 155 Z"
          fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"
        />

        {/* Moon — scaled to match sun size (r=28) */}
        <g transform="translate(200, 52)">
          {/*
            Glow via mask: the mask cuts the glow source to the exact crescent shape
            (full circle minus dark shadow), so the neon halo only emanates from
            the crescent outline — not from the empty space on the other side.
          */}
          {/* Outer wide halo */}
          <g filter="url(#moon-glow)">
            <circle r="30" fill="#bdd0e4" opacity="0.65" mask="url(#moonCrescentMask)" />
          </g>
          {/* Crescent body */}
          <circle r="28" fill="rgba(232,242,255,0.95)" />
          <circle r="24" cx="13" cy="-5" fill="#050510" />
          {/* Inner edge shimmer */}
          <g filter="url(#moon-inner)">
            <circle r="30" fill="#c5e0ff" opacity="0.4" mask="url(#moonCrescentMask)" />
          </g>
          {/* Stars */}
          <circle cx="35" cy="-22" r="1.5" fill="white" opacity="0.8" />
          <circle cx="-31" cy="-15" r="1" fill="white" opacity="0.6" />
        </g>

        {/*
          22 comet tail spheres, step=0.013s → dense enough to merge visually.
          Total tail: 22×0.013=0.286s of path. Duration 1.75s.
        */}
        {Array.from({ length: 22 }, (_, i) => {
          const t = i + 1
          const r = Math.max(1.4, 6.5 - t * 0.232)
          const opacity = Math.max(0.05, 0.82 - t * 0.035)
          return (
            <circle key={i} r={r} fill="white" opacity={opacity}>
              <animateMotion dur="1.75s" begin={`${(t * 0.013).toFixed(3)}s`} repeatCount="indefinite">
                <mpath href="#infinityPath" />
              </animateMotion>
            </circle>
          )
        })}

        {/* Comet head */}
        <circle r="7" fill="white" filter="url(#glow-strong)" className="loading-comet-head">
          <animateMotion dur="1.75s" repeatCount="indefinite">
            <mpath href="#infinityPath" />
          </animateMotion>
        </circle>

        {/* ── Half-Sun below horizon ── */}
        <g transform="translate(200, 263)">
          {/*
            28 triangular spike rays across the lower semicircle (0°→180°, step≈6.67°).
            Each ray is a thin triangle: two base points ±w px apart at disc edge, tip far out.
            Alternating long (outerR=62) / short (outerR=46), base half-width w=1.1/0.8.
            All clipped to below horizon so no rays appear above.
          */}
          <g clipPath="url(#bottomHalfClip)">
            {Array.from({ length: 28 }, (_, i) => {
              const deg   = (i / 27) * 180
              const rad   = (deg * Math.PI) / 180
              const cos   = Math.cos(rad)
              const sin   = Math.sin(rad)
              const perX  = -sin  /* perpendicular direction */
              const perY  =  cos
              const isLong = i % 2 === 0
              const innerR = 30
              const outerR = isLong ? 62 : 46
              const w      = isLong ? 1.1 : 0.8
              const col    = isLong ? 'rgba(255,205,40,0.95)' : 'rgba(230,165,20,0.8)'
              /* Triangle: two base pts + one tip */
              const x1 = cos * innerR + perX * w,  y1 = sin * innerR + perY * w
              const x2 = cos * innerR - perX * w,  y2 = sin * innerR - perY * w
              const x3 = cos * outerR,              y3 = sin * outerR
              return (
                <polygon key={i}
                  points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                  fill={col} />
              )
            })}
            {/* Sun disc */}
            <circle r="28" fill="url(#sunGrad)" />
          </g>
          {/* Wavy horizon stroke — matches the clip boundary exactly */}
          <path
            d="M -70 0 Q -52 -6 -35 0 Q -17 6 0 0 Q 17 -6 35 0 Q 52 6 70 0"
            fill="none" stroke="rgba(255,240,180,0.65)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  )
}

// ─── Music Toggle ─────────────────────────────────────────────────────────────

function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      aria-label={playing ? 'Выключить музыку' : 'Включить музыку'}
      style={{
        position: 'fixed',
        top: 'calc(16px + env(safe-area-inset-top, 0px))',
        right: 'calc(16px + env(safe-area-inset-right, 0px))',
        zIndex: 50, background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', backdropFilter: 'blur(3px)', transition: 'background 0.2s',
        color: 'rgba(255,255,255,0.85)',
      }}>
      {playing ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  )
}

// ─── Scroll Indicator ─────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <div className="scroll-indicator" style={{ color: 'rgba(255,255,255,0.7)', width: 'max-content' }}>
      <svg width="26" height="42" viewBox="0 0 26 42" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="24" height="38" rx="12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        <rect x="11" y="8" width="4" height="7" rx="2" fill="rgba(255,255,255,0.8)" className="scroll-wheel-dot" />
      </svg>
      <span style={{ fontSize: '0.88rem', letterSpacing: '0.18em', fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}>
        Листай
      </span>
    </div>
  )
}

// ─── Page 1 — Welcome ─────────────────────────────────────────────────────────

function Page1Welcome({ guestName, flag, visible, isMobile, showLockHint = false }: {
  guestName: string | null; flag: GuestFlag | undefined; visible: boolean; isMobile: boolean; showLockHint?: boolean
}) {
  const t = getTexts(flag)

  const textContent = visible && guestName ? (
    <>
      <p className="animate-fade-slide-up delay-1"
        style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.8rem)', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginBottom: '-0.1rem' }}>
        {t.greeting}
      </p>
      <h1 className="animate-fade-slide-up delay-2 font-great-vibes"
        style={{ fontSize: 'clamp(2.6rem, 8vw, 4.2rem)', lineHeight: 1.15, color: 'rgba(255,240,245,0.75)', margin: 0 }}>
        {guestName}!
      </h1>
      <p className="animate-fade-slide-up delay-3 font-cormorant"
        style={{ fontSize: 'clamp(1.12rem, 3vw, 1.35rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
        ☾ У нас есть для {t.forYou} особенная новость ☽ 
      </p>
      <p className="animate-fade-slide-up delay-4 font-cormorant"
        style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.3rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, maxWidth: 460 }}>
        Совсем скоро произойдёт событие, которое мы бы очень хотели разделить вместе с {t.withYou} 🤍
      </p>
      <p className="animate-fade-slide-up delay-5 font-playfair"
        style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.02rem)', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: '0.3rem' }}>
        Нечто важное откроется ниже
      </p>
    </>
  ) : visible ? (
    <>
      <h1 className="animate-fade-slide-up font-great-vibes"
        style={{ fontSize: 'clamp(2.2rem, 7vw, 3.7rem)', color: '#fff', lineHeight: 1.3 }}>
        Олег и Влада
      </h1>
      <p className="animate-fade-slide-up delay-2 font-great-vibes"
        style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>
        25 июля 2026
      </p>
      {showLockHint && (
        <p className="animate-fade-slide-up delay-3 font-cormorant"
          style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: '1rem', letterSpacing: '0.05em' }}>
          Приглашение не доступно
        </p>
      )}
    </>
  ) : null

  return (
    <section className="wedding-section">
      <div className="bg-overlay" />
      <div className="section-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
        {/* Frosted glass card on desktop only */}
        {!isMobile && visible ? (
          <div style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '4px',
            padding: '2.2rem 3rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem',
            maxWidth: 530,
          }}>
            <CornerOrnament corner="tl" />
            <CornerOrnament corner="tr" />
            <CornerOrnament corner="br" />
            <CornerOrnament corner="bl" />
            {textContent}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
            {textContent}
          </div>
        )}
      </div>

      {visible && (
        <div className="animate-fade-slide-up delay-6"
          style={{ position: 'absolute', bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ScrollIndicator />
        </div>
      )}
    </section>
  )
}

// ─── Page 2 — Video ───────────────────────────────────────────────────────────

function Page2Video({ flag, audioRef, musicPlaying }: {
  flag: GuestFlag | undefined
  audioRef: React.RefObject<HTMLAudioElement | null>
  musicPlaying: boolean
}) {
  const t = getTexts(flag)

  return (
    <section className="wedding-section">
      <div className="bg-overlay" />
      <div className="section-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: 720 }}>
        <h2 className="font-great-vibes"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', color: '#fff', margin: 0, lineHeight: 1.2 }}>
          Всё начинается здесь
        </h2>
        <p className="font-cormorant"
          style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginTop: '-0.5rem' }}>
          {t.click} для просмотра
        </p>

        <div style={{ width: '100%', padding: '0 1rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto',
            aspectRatio: '16 / 9', borderRadius: '0.75rem', overflow: 'hidden',
            boxShadow: '0 4px 40px rgba(0,0,0,0.6)', background: '#000' }}>
            <iframe
              width="100%" height="100%"
              src="https://rutube.ru/play/embed/49d39d6c02a006145667424bcaa6d2b4/?p=wKeJnp2VClv3yIE4-44BpQ&skinColor=FFFFFF"
              frameBorder="0"
              allow="clipboard-write; autoplay"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
            <a href="https://disk.yandex.ru/i/HJHI54_NOAgL_w"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '0.5rem 1.2rem',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '2rem', color: 'rgba(255,255,255,0.55)',
                fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.88rem',
                fontStyle: 'italic', letterSpacing: '0.04em', textDecoration: 'none' }}>
              Нажать — если видео не загружается
            </a>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <ScrollIndicator />
      </div>
    </section>
  )
}

// ─── Color Swatches ───────────────────────────────────────────────────────────

function ColorSwatches({ colors, label }: { colors: { name: string; color: string }[]; label?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <p style={{ fontSize: '0.9rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem', fontStyle: 'italic' }}>
          {label}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
        {colors.map((c) => (
          <div key={c.name} className="color-swatch">
            <div className="swatch-box" style={{ background: c.color }} />
            <span className="swatch-label">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function CountdownTimer() {
  const [t, setT] = useState(getTimeLeft)
  useEffect(() => {
    const interval = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'relative', padding: '2rem 1rem' }}>
      {COUNTDOWN_STARS.map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
          width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, borderRadius: '50%', background: '#fff',
          animation: `twinkle ${1.5 + (i % 4) * 0.35}s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
      <p className="font-cormorant"
        style={{ fontSize: '0.95rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '1.2rem', fontStyle: 'italic' }}>
        до 25 июля 2026
      </p>
      <div style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 2.5rem)', justifyContent: 'center' }}>
        {[{ value: t.days, label: 'дней' }, { value: t.hours, label: 'часов' }, { value: t.minutes, label: 'минут' }, { value: t.seconds, label: 'секунд' }].map((u) => (
          <div key={u.label} className="countdown-unit">
            <span className="countdown-number">{pad(u.value)}</span>
            <span className="countdown-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── RSVP Form ────────────────────────────────────────────────────────────────

function RSVPForm({ guestId, guestName, flag }: { guestId: string | undefined; guestName: string | undefined; flag: GuestFlag | undefined }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true); setError(null)
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        guest_name: guestName || 'Гость', guest_id: guestId || 'unknown',
        guest_flag: flag || 'unknown', answer: selected,
      }, EMAILJS_PUBLIC_KEY)
      setSubmitted(true)
    } catch { setError('Не удалось отправить ответ. Пожалуйста, попробуйте позже.') }
    finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <div className="details-reveal font-cormorant"
        style={{ maxWidth: 540, margin: '0 auto', padding: '2rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.12)', lineHeight: 1.8 }}>
        <p style={{ fontSize: 'clamp(1.15rem, 3vw, 1.35rem)', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
          Спасибо за внимание к этому дню и за ваш ответ 🤍
        </p>
        <p style={{ fontSize: 'clamp(1.15rem, 3vw, 1.35rem)', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', fontStyle: 'italic' }}>
          С нетерпением ждём встречи!
        </p>
        <p className="font-great-vibes" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', color: '#fff', marginTop: '1rem' }}>
          ☀️ Ваши Олег и Влада 🌙
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 1rem' }}>
      <h3 className="font-great-vibes" style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', color: '#fff', marginBottom: '1.5rem' }}>
        Будем ли мы рядом в этот день?
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {RSVP_OPTIONS.map((opt) => (
          <button key={opt} className={`rsvp-btn${selected === opt ? ' selected' : ''}`} onClick={() => setSelected(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {selected && (
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: '0.85rem 2.5rem', background: submitting ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '2rem', color: '#fff', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontStyle: 'italic', letterSpacing: '0.08em', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {submitting ? 'Идет отправка -->' : 'Подтвердить выбор'}
        </button>
      )}
      {error && <p style={{ marginTop: '1rem', fontSize: '1rem', color: 'rgba(255,150,150,0.8)', fontStyle: 'italic' }}>{error}</p>}
    </div>
  )
}

// ─── Page 3 ───────────────────────────────────────────────────────────────────

function Page3Details({ flag, guestId, guestName }: { flag: GuestFlag | undefined; guestId: string | undefined; guestName: string | undefined }) {
  const [detailsVisible, setDetailsVisible] = useState(false)
  const t = getTexts(flag)

  return (
    <section className="wedding-section-long page3-section">
      <div className="bg-overlay" style={{ position: 'fixed', zIndex: -1 }} />

      {/* Mobile: photo zone at top (≥40vh), content card below */}
      <div className="page3-photo-zone" />

      <div className="page3-content" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 680, padding: '0 1.5rem' }}>
        <p className="font-great-vibes" style={{ fontSize: 'clamp(3rem, 9vw, 5.2rem)', color: '#fff', lineHeight: 1.1, margin: '0 0 2rem' }}>
          25.07.2026
        </p>

        {!detailsVisible && (
          <div style={{ marginBottom: '2.5rem' }}>
            <button onClick={() => setDetailsVisible(true)}
              style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.6rem', color: '#fff', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.15rem, 3vw, 1.35rem)', fontStyle: 'italic', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.25s', display: 'block', margin: '0 auto' }}>
              Подробнее о том, как пройдёт этот день
            </button>
            <p className="font-cormorant" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.5rem', fontStyle: 'italic' }}>Нажми</p>
          </div>
        )}

        {detailsVisible && (
          <div className="details-reveal font-cormorant" style={{ textAlign: 'left', lineHeight: 1.75 }}>
            <p style={{ fontSize: 'clamp(1.15rem, 3vw, 1.3rem)', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
              Мы бы очень хотели, чтобы столь важный для нас день прошел именно с {t.withYou} ♡︎
            </p>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)', color: 'rgba(255,255,255,0.9)', marginBottom: '0.3rem' }}>
                🕊️ <strong>Начало церемонии — 13:00</strong> 🕐
              </p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: 'rgba(255,255,255,0.7)' }}>
                💒 Дворец бракосочетания № 1
              </p>
              <p style={{ fontSize: 'clamp(0.95rem, 2.3vw, 1.1rem)', color: 'rgba(255,255,255,0.55)' }}>
                🏴Английская набережная 28
              </p>
            </div>
            <p style={{ fontSize: 'clamp(0.95rem, 2.3vw, 1.1rem)', color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
              Мы поймём, если {t.Joiing} к нам позже❣︎
            </p>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.2rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)', color: 'rgba(255,255,255,0.9)', marginBottom: '0.3rem' }}>
                🥂 <strong>Фуршет — 15:00 ✧ Банкет — 16:00</strong>🍾
              </p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: 'rgba(255,255,255,0.7)' }}>🏰 Атриум Холл</p>
              <p style={{ fontSize: 'clamp(0.95rem, 2.3vw, 1.1rem)', color: 'rgba(255,255,255,0.55)' }}>🏴󠁧󠁢󠁥󠁮Английская набережная 70</p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
              <h3 className="font-great-vibes" style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', color: '#fff', marginBottom: '1rem' }}>
                Дресс-код
              </h3>
              <p style={{ fontSize: 'clamp(1.05rem, 2.6vw, 1.2rem)', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '1.2rem' }}>
                Будем признательны, если {t.youSupport} атмосферу нашего праздника,
                выбрав наряд в светлых, пастельных или приглушённых тонах
              </p>
              <ColorSwatches colors={MAIN_COLORS} label="основная палитра для леди" />
              <ColorSwatches colors={ACCENT_COLORS} label="палитра для джентельменов" />
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Просим по возможности{' '}
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  избегать ярких оттенков и излишне контрастных сочетаний
                </span>
              </p>
              <p style={{ fontSize: 'clamp(0.95rem, 2.3vw, 1.35rem)', color: 'rgba(255,255,255,0.45)', marginTop: '0.8rem', fontStyle: 'italic' }}>
                Остальные детали торжества мы сообщим немного позднее ⴵ
              </p>
              <p style={{ fontSize: 'clamp(1.05rem, 2.6vw, 1.2rem)', color: 'rgba(255,255,255,0.7)', marginTop: '0.8rem' }}>
               ☽☀︎Пожалуйста, {t.Accept} участие через форму ниже☀︎☾
              </p>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', marginTop: '2.5rem', textAlign: 'center' }}>
          <RSVPForm guestId={guestId} guestName={guestName} flag={flag} />
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', marginTop: '2.5rem', marginBottom: '4rem', textAlign: 'center' }}>
          <CountdownTimer />
        </div>
      </div>{/* end page3-content */}
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

function WeddingPage() {
  if (typeof document === 'undefined') return null
  const { id } = Route.useSearch()
  const guest = id ? guests.find((g) => g.id === id) : undefined
  const hasAccess = !!id && !!guest

  const [loadingDone, setLoadingDone] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [bgOpacities, setBgOpacities] = useState<[number, number, number]>([1, 0, 0])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const ratio = el.scrollTop / (el.clientHeight || window.innerHeight)
    setBgOpacities([
      Math.max(0, Math.min(1, 1 - ratio)),
      Math.max(0, Math.min(1, ratio < 1 ? ratio : 2 - ratio)),
      Math.max(0, Math.min(1, ratio - 1)),
    ])
  }, [])

  useEffect(() => {
    if (!loadingDone) return
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [loadingDone, handleScroll])

  useEffect(() => {
    if (loadingDone) requestAnimationFrame(() => setContentVisible(true))
  }, [loadingDone])

  useEffect(() => {
    if (!loadingDone) return
    const audio = audioRef.current
    if (!audio) return

    const tryPlay = async () => {
      try {
        audio.volume = 0
        audio.loop = true
        await audio.play()
        setMusicPlaying(true)
        await fadeAudio(audio, MUSIC_VOLUME, 1800)
      } catch {
        const playOnInteraction = async () => {
          const a = audioRef.current
          if (!a) return
          try {
            a.volume = 0; a.loop = true
            await a.play()
            setMusicPlaying(true)
            await fadeAudio(a, MUSIC_VOLUME, 1800)
          } catch { /* still blocked */ }
        }
        window.addEventListener('pointerdown', playOnInteraction, { once: true })
        window.addEventListener('touchstart', playOnInteraction, { once: true })
      }
    }
    tryPlay()
  }, [loadingDone])

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (musicPlaying) {
      await fadeAudio(audio, 0, 600)
      audio.pause()
      audio.volume = MUSIC_VOLUME
      setMusicPlaying(false)
    } else {
      audio.volume = 0
      try {
        await audio.play()
        setMusicPlaying(true)
        await fadeAudio(audio, MUSIC_VOLUME, 900)
      } catch { /* blocked */ }
    }
  }, [musicPlaying])

  const BG_IMAGES = isMobile
    ? ['/images/page1-mobile.jpg', '/images/page2-mobile.jpg', '/images/page3-mobile.jpg']
    : ['/images/page1.jpg', '/images/page2.jpg', '/images/page3.jpg']

  return (
    <>
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="none" />

      {/* Crossfade background layers */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {BG_IMAGES.map((src, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            opacity: loadingDone ? bgOpacities[i] : 0,
            transition: 'opacity 1.1s ease-in-out',
          }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,20,0.52)', zIndex: 1 }} />
      </div>

      {!loadingDone && <LoadingScreen onComplete={() => setLoadingDone(true)} />}
      {loadingDone && <MusicToggle playing={musicPlaying} onToggle={toggleMusic} />}

      {/* If no valid guest ID → locked to page 1 only */}
      {hasAccess ? (
        <div ref={scrollContainerRef} className="wedding-scroll"
          style={{ opacity: contentVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          <Page1Welcome guestName={guest?.name ?? null} flag={guest?.flag} visible={contentVisible} isMobile={isMobile} />
          <Page2Video flag={guest?.flag} audioRef={audioRef} musicPlaying={musicPlaying} />
          <Page3Details flag={guest?.flag} guestId={id} guestName={guest?.name} />
        </div>
      ) : (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2,
          opacity: contentVisible ? 1 : 0, transition: 'opacity 0.6s ease',
          overflow: 'hidden',
        }}>
          <Page1Welcome guestName={null} flag={undefined} visible={contentVisible} isMobile={isMobile} showLockHint />
        </div>
      )}
    </>
  )
}
