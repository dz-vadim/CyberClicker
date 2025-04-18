"use client"

import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface GlitchProps extends HTMLAttributes<HTMLDivElement> {}

const Glitch = forwardRef<HTMLDivElement, GlitchProps>(({ className, children, style, ...props }, ref) => {
  const textColor = style?.color || "#ff2a6d"

  return (
    <div className={cn("relative", className)} style={style} ref={ref} {...props}>
      {/* Main text */}
      <div className="relative z-10">{children}</div>

      {/* Glitch layers */}
      <div
        className="absolute left-0 top-0 z-0 opacity-70"
        style={{
          color: textColor,
          textShadow: "2px 0 #05d9e8",
          animation: "glitch-anim-1 2s infinite linear alternate-reverse",
          clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
        }}
      >
        {children}
      </div>

      <div
        className="absolute left-0 top-0 z-0 opacity-70"
        style={{
          color: textColor,
          textShadow: "-2px 0 #05d9e8",
          animation: "glitch-anim-2 3s infinite linear alternate-reverse",
          clipPath: "polygon(0 80%, 100% 20%, 100% 100%, 0 100%)",
        }}
      >
        {children}
      </div>

      <style jsx>{`
          @keyframes glitch-anim-1 {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
          }
          
          @keyframes glitch-anim-2 {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(2px, -2px); }
            40% { transform: translate(2px, 2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(-2px, 2px); }
          }
        `}</style>
    </div>
  )
})

Glitch.displayName = "Glitch"

export default Glitch
