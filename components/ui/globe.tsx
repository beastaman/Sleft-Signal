"use client"

import createGlobe, { type COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 191 / 255, 36 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [51.5074, -0.1278], size: 0.1 },
    { location: [35.6762, 139.6503], size: 0.08 },
    { location: [37.7749, -122.4194], size: 0.08 },
    { location: [48.8566, 2.3522], size: 0.07 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-33.8688, 151.2093], size: 0.05 },
    { location: [1.3521, 103.8198], size: 0.07 },
    { location: [25.2048, 55.2708], size: 0.07 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [55.7558, 37.6176], size: 0.06 },
    { location: [52.5200, 13.4050], size: 0.05 },
    { location: [28.6139, 77.2090], size: 0.08 },
  ],
}

// Fixed particle positions to prevent hydration mismatch
const FIXED_PARTICLES = [
  { left: 25, top: 30, delay: 0, duration: 4.5 },
  { left: 65, top: 45, delay: 0.8, duration: 5.2 },
  { left: 40, top: 70, delay: 1.6, duration: 4.8 },
  { left: 70, top: 25, delay: 2.4, duration: 5.5 },
  { left: 30, top: 80, delay: 3.2, duration: 4.3 },
  { left: 60, top: 60, delay: 4.0, duration: 5.0 },
]

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"))
    return () => globe.destroy()
  }, [])

  return (
    <div className={cn("absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]", className)}>
      <canvas
        className={cn("size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]")}
        ref={canvasRef}
        onPointerDown={(e) => updatePointerInteraction(e.clientX - pointerInteractionMovement.current)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
      
      {/* Animated connection lines overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(251, 191, 36)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(251, 191, 36)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Animated connection paths between major cities */}
          <g className="opacity-60">
            <path
              d="M 200 250 Q 300 200 400 250"
              stroke="url(#connectionGradient)"
              strokeWidth="1.5"
              fill="none"
              className="animate-pulse"
              strokeDasharray="4,4"
            />
            <path
              d="M 250 200 Q 350 150 450 200"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
              strokeDasharray="3,3"
            />
            <path
              d="M 150 300 Q 300 250 450 300"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '2s' }}
              strokeDasharray="2,2"
            />
            <path
              d="M 180 180 Q 300 120 420 180"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
              strokeDasharray="3,3"
            />
          </g>
          
          {/* Pulsing connection nodes */}
          <g>
            {[
              { x: 200, y: 250, delay: 0 },
              { x: 400, y: 250, delay: 0.5 },
              { x: 300, y: 200, delay: 1 },
              { x: 350, y: 300, delay: 1.5 },
              { x: 450, y: 200, delay: 2 },
              { x: 250, y: 350, delay: 2.5 },
            ].map((node, i) => (
              <g key={i}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="2"
                  fill="rgb(251, 191, 36)"
                  className="animate-ping"
                  style={{ animationDelay: `${node.delay}s` }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="1"
                  fill="rgb(251, 191, 36)"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>
      
      {/* Fixed position floating particles to prevent hydration mismatch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FIXED_PARTICLES.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/60 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
