"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface UpgradeItemProps {
  name: string
  description: string
  icon: React.ReactNode
  level: number
  cost: number
  canAfford: boolean
  isMaxed?: boolean
  onClick: () => void
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  infinite?: boolean
  formatNumber?: (num: number) => string
  isLocked?: boolean // Add this prop
}

export default function UpgradeItem({
  name,
  description,
  icon,
  level,
  cost,
  canAfford,
  isMaxed = false,
  onClick,
  primaryColor = "#ff2a6d",
  secondaryColor = "#05d9e8",
  accentColor = "#39ff14",
  infinite = false,
  formatNumber = (num: number) => Math.floor(num).toLocaleString(),
  isLocked = false, // Default to unlocked
}: UpgradeItemProps) {
  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-between rounded-sm border-2 p-3 transition-all duration-300",
        isLocked
          ? "border-opacity-30 bg-opacity-5 cursor-not-allowed"
          : isMaxed
            ? "border-opacity-100 bg-opacity-20"
            : canAfford
              ? "border-opacity-80 bg-opacity-10 hover:bg-opacity-20"
              : "border-opacity-30 bg-opacity-5",
      )}
      style={{
        borderColor: isLocked
          ? `${secondaryColor}30`
          : isMaxed
            ? accentColor
            : canAfford
              ? secondaryColor
              : `${secondaryColor}50`,
        backgroundColor: isLocked
          ? `${secondaryColor}05`
          : isMaxed
            ? `${accentColor}20`
            : canAfford
              ? `${secondaryColor}10`
              : `${secondaryColor}05`,
        boxShadow: isLocked
          ? "none"
          : isMaxed
            ? `0 0 10px ${accentColor}40`
            : canAfford
              ? `0 0 5px ${secondaryColor}40`
              : "none",
      }}
      onClick={isLocked ? undefined : onClick}
    >
      <div className="mb-1 flex w-full items-center justify-between">
        <div className="flex items-center">
          <div
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-sm"
            style={{ color: isLocked ? `${secondaryColor}50` : isMaxed ? accentColor : secondaryColor }}
          >
            {icon}
          </div>
          <div>
            <div
              className="text-sm font-bold"
              style={{ color: isLocked ? `${primaryColor}50` : isMaxed ? accentColor : primaryColor }}
            >
              {name}
            </div>
            <div
              className="text-xs opacity-80"
              style={{ color: isLocked ? `${secondaryColor}50` : isMaxed ? accentColor : secondaryColor }}
            >
              {isMaxed ? "MAXED" : isLocked ? "LOCKED" : `¥${formatNumber(cost)}`}
            </div>
          </div>
        </div>

        <div
          className="text-xs font-bold"
          style={{ color: isLocked ? `${secondaryColor}50` : isMaxed ? accentColor : secondaryColor }}
        >
          {level}
          {!infinite && !isMaxed ? "/∞" : ""}
        </div>
      </div>

      <div
        className="w-full text-xs opacity-70"
        style={{ color: isLocked ? `${secondaryColor}50` : isMaxed ? accentColor : secondaryColor }}
      >
        {description}
      </div>

      {/* Progress indicator for infinite upgrades */}
      {level > 0 && (
        <div className="mt-2 flex w-full items-center gap-1">
          {Array.from({ length: Math.min(level, 5) }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ backgroundColor: isMaxed ? accentColor : secondaryColor }}
            ></div>
          ))}
          {level > 5 && (
            <div className="text-xs font-bold" style={{ color: isMaxed ? accentColor : secondaryColor }}>
              +{level - 5}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
