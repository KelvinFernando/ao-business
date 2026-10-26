import { Fit, Layout, useRive } from '@rive-app/react-webgl2'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

type Point = { x: number; y: number }
type Pose = { x: number; y: number; rotation: number; scale: number; opacity: number }
type Rect = { left: number; top: number; width: number; height: number }
type Sample = Point & { time: number }
type DragSession = {
  pointerId: number
  start: Point
  origin: Point
  nav: HTMLElement
  rect: Rect | null
  samples: Sample[]
  pose: Pose
  dragging: boolean
}

const restPose: Pose = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }
const dragThreshold = 6
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const readRect = (element: HTMLElement): Rect => {
  const { left, top, width, height } = element.getBoundingClientRect()
  return { left, top, width, height }
}
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function PrototypeBadge() {
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frame = useRef<number | null>(null)
  const exitAnimation = useRef<Animation | null>(null)
  const drag = useRef<DragSession | null>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'returning' | 'falling'>('idle')
  const [interacted, setInteracted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [pose, setPose] = useState<Pose>(restPose)
  const { RiveComponent, rive } = useRive({
    src: '/prototype.riv',
    artboard: 'Prototype Badge',
    stateMachines: 'Prototype idle',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
  })

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    if (jumpTimer.current) clearTimeout(jumpTimer.current)
    if (frame.current) cancelAnimationFrame(frame.current)
    exitAnimation.current?.cancel()
  }, [])

  const clearResumeTimer = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = null
  }

  const cancelMotion = () => {
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = null
    exitAnimation.current?.cancel()
    exitAnimation.current = null
  }

  useEffect(() => {
    if (!rive || phase !== 'idle' || dismissed || prefersReducedMotion()) return
    let cancelled = false
    const scheduleJump = () => {
      jumpTimer.current = setTimeout(() => {
        if (cancelled) return
        if (document.hidden) {
          scheduleJump()
          return
        }
        const badge = badgeRef.current
        if (!badge || getComputedStyle(badge).visibility === 'hidden') return
        rive.stop('Prototype idle')
        rive.stop('Happy jump')
        rive.play('Happy jump')
        resumeTimer.current = setTimeout(() => {
          if (cancelled) return
          rive.stop('Happy jump')
          rive.play('Prototype idle')
          scheduleJump()
        }, 1200)
      }, 3200 + Math.random() * 4800)
    }
    scheduleJump()
    return () => {
      cancelled = true
      if (jumpTimer.current) clearTimeout(jumpTimer.current)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      jumpTimer.current = null
      resumeTimer.current = null
      rive.stop('Happy jump')
      rive.play('Prototype idle')
    }
  }, [rive, phase, dismissed])

  const returnToNav = (session: DragSession) => {
    cancelMotion()
    const start = session.pose
    setPhase('returning')
    if (prefersReducedMotion()) {
      setPose(restPose)
      setInteracted(false)
      setPhase('idle')
      return
    }
    const startedAt = performance.now()
    const tick = (now: number) => {
      const progress = clamp((now - startedAt) / 240, 0, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const remaining = 1 - eased
      setPose({
        x: start.x * remaining,
        y: start.y * remaining,
        rotation: start.rotation * remaining,
        scale: start.scale + (1 - start.scale) * eased,
        opacity: 1,
      })
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      frame.current = null
      setPose(restPose)
      setInteracted(false)
      setPhase('idle')
    }
    frame.current = requestAnimationFrame(tick)
  }

  const releaseVelocity = (samples: Sample[]) => {
    const last = samples[samples.length - 1]
    const recent = samples.filter(sample => last.time - sample.time <= 120)
    const first = recent[0] ?? last
    const elapsed = Math.max(16, last.time - first.time)
    return {
      x: clamp((last.x - first.x) / elapsed * 1000, -1600, 1600),
      y: clamp((last.y - first.y) / elapsed * 1000, -1400, 1200),
    }
  }

  const fallAndDismiss = (rect: Rect, start: Pose, velocity: Point) => {
    cancelMotion()
    setInteracted(true)
    setPhase('falling')
    if (prefersReducedMotion()) {
      setPose({ ...start, rotation: 0, scale: 1, opacity: 1 })
      const element = motionRef.current
      if (!element) {
        setDismissed(true)
        return
      }
      exitAnimation.current = element.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 160, easing: 'cubic-bezier(.3,0,1,1)', fill: 'forwards' },
      )
      exitAnimation.current.onfinish = () => setDismissed(true)
      return
    }

    const current = { ...start, opacity: 1 }
    const horizontalVelocity = velocity.x
    let verticalVelocity = velocity.y
    const spin = Math.abs(velocity.x) > 80 ? clamp(velocity.x * 0.12, -240, 240) : start.rotation >= 0 ? 70 : -70
    const startedAt = performance.now()
    let previous = startedAt
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.034)
      previous = now
      current.x += horizontalVelocity * delta
      current.y += verticalVelocity * delta
      verticalVelocity += 1900 * delta
      current.rotation += spin * delta
      current.scale += (1 - current.scale) * Math.min(1, delta * 12)
      const top = rect.top + current.y
      current.opacity = clamp((window.innerHeight + rect.height - top) / (rect.height * 1.5), 0, 1)
      setPose({ ...current })
      if (top > window.innerHeight + rect.height || now - startedAt > 5000) {
        frame.current = null
        setDismissed(true)
        return
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const isSafeLanding = (session: DragSession, point: Point) => {
    if (!session.rect) return true
    const nav = session.nav.getBoundingClientRect()
    const margin = 14
    const pointerOnNav = point.x >= nav.left - margin && point.x <= nav.right + margin
      && point.y >= nav.top - margin && point.y <= nav.bottom + margin
    const footX = session.rect.left + session.pose.x + session.rect.width / 2
    const footY = session.rect.top + session.pose.y + session.rect.height
    const standingOnNav = footX >= nav.left - margin && footX <= nav.right + margin
      && footY >= nav.top - session.rect.height - 32 && footY <= nav.bottom + margin
    return pointerOnNav || standingOnNav
  }

  const beginDrag = (event: PointerEvent<HTMLButtonElement>, session: DragSession) => {
    session.dragging = true
    session.origin = { x: event.clientX, y: event.clientY }
    session.rect = readRect(event.currentTarget)
    session.samples = [{ x: event.clientX, y: event.clientY, time: event.timeStamp }]
    session.pose = { ...restPose, scale: prefersReducedMotion() ? 1 : 1.04 }
    clearResumeTimer()
    rive?.stop('Happy jump')
    rive?.play('Prototype idle')
    setInteracted(true)
    setPhase('dragging')
    setPose(session.pose)
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (phase !== 'idle' || event.button !== 0) return
    const nav = badgeRef.current?.closest<HTMLElement>('.prototype-bar')
    if (!nav) return
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: { x: event.clientX, y: event.clientY },
      nav,
      rect: null,
      samples: [{ x: event.clientX, y: event.clientY, time: event.timeStamp }],
      pose: restPose,
      dragging: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const session = drag.current
    if (!session || session.pointerId !== event.pointerId) return
    if (!session.dragging) {
      const distance = Math.hypot(event.clientX - session.start.x, event.clientY - session.start.y)
      if (distance < dragThreshold) return
      beginDrag(event, session)
      event.preventDefault()
      return
    }
    const sample = { x: event.clientX, y: event.clientY, time: event.timeStamp }
    session.samples = [...session.samples.filter(item => sample.time - item.time <= 120), sample]
    const recent = session.samples[0]
    const elapsed = Math.max(16, sample.time - recent.time)
    const velocityX = (sample.x - recent.x) / elapsed * 1000
    const x = event.clientX - session.origin.x
    const y = event.clientY - session.origin.y
    session.pose = {
      x,
      y,
      rotation: prefersReducedMotion() ? 0 : clamp(x * 0.035 + velocityX * 0.012, -20, 20),
      scale: prefersReducedMotion() ? 1 : 1.04,
      opacity: 1,
    }
    setPose(session.pose)
    event.preventDefault()
  }

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const session = drag.current
    if (!session || session.pointerId !== event.pointerId) return
    session.samples = [...session.samples, { x: event.clientX, y: event.clientY, time: event.timeStamp }]
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!session.dragging || !session.rect) return

    if (isSafeLanding(session, { x: event.clientX, y: event.clientY })) {
      returnToNav(session)
    } else {
      fallAndDismiss(session.rect, session.pose, releaseVelocity(session.samples))
    }
  }

  const onPointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    const session = drag.current
    if (!session || session.pointerId !== event.pointerId) return
    drag.current = null
    if (session.dragging) returnToNav(session)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (phase !== 'idle' || event.repeat || !['Delete', 'Backspace'].includes(event.key)) return
    const nav = badgeRef.current?.closest<HTMLElement>('.prototype-bar')
    if (!nav) return
    event.preventDefault()
    clearResumeTimer()
    nav.querySelector<HTMLButtonElement>('.glass-btn')?.focus()
    fallAndDismiss(readRect(event.currentTarget), restPose, { x: 80, y: 80 })
  }

  if (dismissed) return null

  return (
    <div ref={badgeRef} className={`prototype-badge ${interacted ? 'is-interacted' : ''} ${phase !== 'idle' ? `is-${phase}` : ''}`}>
      <div
        ref={motionRef}
        className="prototype-badge-drag"
        style={{
          transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.rotation}deg) scale(${pose.scale})`,
          opacity: pose.opacity,
        }}
      >
        <div className="prototype-badge-travel">
          <button
            type="button"
            className="prototype-badge-button"
            aria-label="Prototype mascot. Drag away from prototype controls or press Delete to dismiss."
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            <RiveComponent />
          </button>
        </div>
      </div>
    </div>
  )
}
