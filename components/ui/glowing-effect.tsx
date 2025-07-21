"use client"

import type React from "react"

import { memo, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { animate } from "framer-motion"

interface GlowingEffectProps {
  blur?: number
  inactiveZone?: number
  proximity?: number
  spread?: number
  variant?: "default" | "white"
  glow?: boolean
  className?: string
  disabled?: boolean
  movementDuration?: number
  borderWidth?: number
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const lastPos = useRef({ x: 0, y: 0 })
    const raf = useRef<number>(0)

    const handleMove = useCallback(
      (e?: { x: number; y: number }) => {
        if (!containerRef.current) return
        if (raf.current) cancelAnimationFrame(raf.current)

        raf.current = requestAnimationFrame(() => {
          const el = containerRef.current!
          const { left, top, width, height } = el.getBoundingClientRect()
          const mouseX = e?.x ?? lastPos.current.x
          const mouseY = e?.y ?? lastPos.current.y

          if (e) lastPos.current = { x: mouseX, y: mouseY }

          const center = [left + width / 2, top + height / 2]
          const dist = Math.hypot(mouseX - center[0], mouseY - center[1])
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone
          if (dist < inactiveRadius) {
            el.style.setProperty("--active", "0")
            return
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity

          el.style.setProperty("--active", isActive ? "1" : "0")
          if (!isActive) return

          const current = Number.parseFloat(el.style.getPropertyValue("--start")) || 0
          const target = (Math.atan2(mouseY - center[1], mouseX - center[0]) * 180) / Math.PI + 90
          const diff = ((target - current + 180) % 360) - 180
          const newAngle = current + diff

          animate(current, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => el.style.setProperty("--start", v.toString()),
          })
        })
      },
      [inactiveZone, proximity, movementDuration],
    )

    useEffect(() => {
      if (disabled) return
      const onPointer = (e: PointerEvent) => handleMove({ x: e.clientX, y: e.clientY })
      const onScroll = () => handleMove()
      document.body.addEventListener("pointermove", onPointer, { passive: true })
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => {
        if (raf.current) cancelAnimationFrame(raf.current)
        document.body.removeEventListener("pointermove", onPointer)
        window.removeEventListener("scroll", onScroll)
      }
    }, [handleMove, disabled])

    return (
      <>
        {/* border glow */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block",
          )}
        />
        {/* main effect */}
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": 0,
              "--active": 0,
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--gradient": `radial-gradient(circle, #fbbf24 10%, #fbbf2400 20%)`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)]",
            className,
            disabled && "!hidden",
          )}
        >
          <div
            className={cn(
              "rounded-[inherit]",
              'after:content-[""] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))] after:rounded-[inherit]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#0000_0deg,#fff,#0000_calc(var(--spread)*2deg))]",
            )}
          />
        </div>
      </>
    )
  },
)

GlowingEffect.displayName = "GlowingEffect"
export { GlowingEffect }
