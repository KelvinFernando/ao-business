import { Fit, Layout, useRive } from '@rive-app/react-webgl2'
import { useEffect, useRef } from 'react'

export function PrototypeBadge() {
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { RiveComponent, rive } = useRive({
    src: '/prototype.riv',
    artboard: 'Prototype Badge',
    stateMachines: 'Prototype idle',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
  })

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }, [])

  const jump = () => {
    if (!rive) return
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    rive.stop('Prototype idle')
    rive.stop('Happy jump')
    rive.play('Happy jump')
    resumeTimer.current = setTimeout(() => {
      rive.stop('Happy jump')
      rive.play('Prototype idle')
    }, 1200)
  }

  return (
    <div className="prototype-badge">
      <div className="prototype-badge-travel">
        <button type="button" className="prototype-badge-button" aria-label="Make the prototype mascot jump" onClick={jump}>
          <RiveComponent />
        </button>
      </div>
    </div>
  )
}
