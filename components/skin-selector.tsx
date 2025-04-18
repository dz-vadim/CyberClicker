"use client"

import { cn } from "@/lib/utils"
import { Palette, Lock } from "lucide-react"

interface SkinSelectorProps {
  name: string
  description: string
  cost: number
  owned: boolean
  isActive: boolean
  canAfford: boolean
  isUnlockable: boolean
  onBuy: () => void
  onApply: () => void
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  primaryColor?: string
  secondaryColor?: string
  prerequisite: string | null
}

export default function SkinSelector({
  name,
  description,
  cost,
  owned,
  isActive,
  canAfford,
  isUnlockable,
  onBuy,
  onApply,
  colors,
  primaryColor = "#ff2a6d",
  secondaryColor = "#05d9e8",
  prerequisite,
}: SkinSelectorProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-sm border-2 p-3 transition-all duration-300",
        !isUnlockable && "opacity-70",
        isActive
          ? "border-opacity-100 bg-opacity-20"
          : owned
            ? "border-opacity-80 bg-opacity-10 hover:bg-opacity-20"
            : canAfford && isUnlockable
              ? "border-opacity-60 bg-opacity-5 hover:bg-opacity-10"
              : "border-opacity-30 bg-opacity-5",
      )}
      style={{
        borderColor: isActive
          ? colors.primary
          : owned
            ? secondaryColor
            : canAfford && isUnlockable
              ? `${secondaryColor}80`
              : `${secondaryColor}40`,
        backgroundColor: isActive ? `${colors.primary}20` : owned ? `${secondaryColor}10` : `${secondaryColor}05`,
        boxShadow: isActive ? `0 0 10px ${colors.primary}40` : owned ? `0 0 5px ${secondaryColor}40` : "none",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-bold" style={{ color: isActive ? colors.primary : primaryColor }}>
          {name}
        </div>
        {!isUnlockable ? (
          <Lock className="h-5 w-5" style={{ color: secondaryColor }} />
        ) : (
          <Palette className="h-5 w-5" style={{ color: isActive ? colors.primary : secondaryColor }} />
        )}
      </div>

      <div className="mb-3 text-xs opacity-70" style={{ color: isActive ? colors.primary : secondaryColor }}>
        {!isUnlockable && prerequisite ? `Unlock ${prerequisite} first` : description}
      </div>

      {/* Color preview */}
      <div className="mb-3 flex justify-between gap-2">
        {Object.values(colors).map((color, index) => (
          <div
            key={index}
            className="h-4 w-full rounded-sm"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}80`,
            }}
          ></div>
        ))}
      </div>

      <div className="flex gap-2">
        {!owned ? (
          <button
            className={cn(
              "w-full rounded-sm border py-1 text-xs font-bold uppercase transition-all",
              (!canAfford || !isUnlockable) && "opacity-50",
            )}
            style={{
              borderColor: canAfford && isUnlockable ? secondaryColor : `${secondaryColor}50`,
              color: canAfford && isUnlockable ? secondaryColor : `${secondaryColor}80`,
            }}
            onClick={onBuy}
            disabled={!canAfford || !isUnlockable}
          >
            Buy ¥{cost.toLocaleString()}
          </button>
        ) : (
          <button
            className={cn(
              "w-full rounded-sm border py-1 text-xs font-bold uppercase transition-all",
              isActive ? "border-opacity-100 bg-opacity-20" : "border-opacity-80 hover:bg-opacity-10",
            )}
            style={{
              borderColor: isActive ? colors.primary : secondaryColor,
              backgroundColor: isActive ? `${colors.primary}20` : "transparent",
              color: isActive ? colors.primary : secondaryColor,
            }}
            onClick={onApply}
          >
            {isActive ? "Active" : "Apply"}
          </button>
        )}
      </div>
    </div>
  )
}
