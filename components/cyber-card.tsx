import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CyberCardProps extends HTMLAttributes<HTMLDivElement> {
  primaryColor?: string
  secondaryColor?: string
}

const CyberCard = forwardRef<HTMLDivElement, CyberCardProps>(
  ({ className, primaryColor, secondaryColor, children, ...props }, ref) => {
    // Use provided colors or defaults
    const primary = primaryColor || "#ff2a6d"
    const secondary = secondaryColor || "#05d9e8"

    return (
      <div
        className={cn("relative rounded-sm border-2 bg-cyber-darker/80 p-6", className)}
        style={{
          borderColor: secondary,
          boxShadow: `0 0 20px ${secondary}40`,
        }}
        ref={ref}
        {...props}
      >
        {/* Corner accents */}
        <div
          className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2"
          style={{
            borderColor: primary,
            boxShadow: `-2px -2px 8px -2px ${primary}80`,
          }}
        ></div>
        <div
          className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2"
          style={{
            borderColor: primary,
            boxShadow: `2px -2px 8px -2px ${primary}80`,
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2"
          style={{
            borderColor: primary,
            boxShadow: `-2px 2px 8px -2px ${primary}80`,
          }}
        ></div>
        <div
          className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2"
          style={{
            borderColor: primary,
            boxShadow: `2px 2px 8px -2px ${primary}80`,
          }}
        ></div>

        {/* Digital noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    )
  },
)

CyberCard.displayName = "CyberCard"

export default CyberCard
