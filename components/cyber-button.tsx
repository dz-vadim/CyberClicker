"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
  primaryColor?: string
  secondaryColor?: string
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, color = "blue", primaryColor, secondaryColor, children, ...props }, ref) => {
    // Use provided colors or defaults
    const primary = primaryColor || "#ff2a6d"
    const secondary = secondaryColor || "#05d9e8"

    return (
      <button
        className={cn(
          "relative overflow-hidden rounded-sm border-2 bg-cyber-darker/80 px-6 py-2 font-bold uppercase tracking-wider transition-all duration-300",
          className,
        )}
        style={{
          borderColor: primary,
          color: primary,
          boxShadow: `0 0 10px ${primary}80, inset 0 0 5px ${primary}80`,
        }}
        ref={ref}
        {...props}
      >
        <div className="relative z-10 flex items-center justify-center">{children}</div>

        {/* Animated line effect */}
        <div
          className="absolute bottom-0 left-0 h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${primary})`,
            animation: "cyberscan 2s linear infinite",
          }}
        />

        <style jsx>{`
          @keyframes cyberscan {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </button>
    )
  },
)

CyberButton.displayName = "CyberButton"

export default CyberButton
