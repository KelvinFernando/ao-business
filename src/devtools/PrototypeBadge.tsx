import { Fit, Layout, useRive } from '@rive-app/react-webgl2'

export function PrototypeBadge() {
  const { RiveComponent } = useRive({
    src: '/prototype.riv',
    artboard: 'Prototype Badge',
    stateMachines: 'Prototype idle',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
  })

  return (
    <div className="prototype-badge" role="img" aria-label="Animated prototype controls badge">
      <RiveComponent />
    </div>
  )
}
