"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AntiEffect } from "@/utils/anti-effects"
import { formatNumber } from "@/utils/format-number"
import type { Language } from "@/utils/language"

interface AntiEffectsPanelProps {
  activeEffects: AntiEffect[]
  money: number
  onFixEffect: (effectId: string) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}

export default function AntiEffectsPanel({
  activeEffects,
  money,
  onFixEffect,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: AntiEffectsPanelProps) {
  const [expanded, setExpanded] = useState(false)

  if (activeEffects.length === 0) return null

  return (
    <div className="w-full mb-4">
      <div
        className="mb-2 flex cursor-pointer items-center justify-between rounded-sm border-2 p-2"
        style={{
          borderColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}40`,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" style={{ color: accentColor }} />
          <span className="font-bold uppercase tracking-wider" style={{ color: accentColor }}>
            {language === "en" ? "Active Problems" : "Активні проблеми"} ({activeEffects.length})
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {activeEffects.map((effect) => (
                <div
                  key={effect.id}
                  className="flex items-center justify-between rounded-sm border-2 p-2"
                  style={{
                    borderColor: `${accentColor}80`,
                    backgroundColor: `${accentColor}10`,
                  }}
                >
                  <div>
                    <div className="font-bold" style={{ color: accentColor }}>
                      {language === "en" ? effect.id.charAt(0).toUpperCase() + effect.id.slice(1) : effect.name}
                    </div>
                    <div className="text-xs opacity-80" style={{ color: secondaryColor }}>
                      {language === "en"
                        ? effect.type === "click"
                          ? `Reduces click income by ${effect.severity * 100}%`
                          : effect.type === "critical"
                            ? "Blocks critical clicks"
                            : effect.type === "auto"
                              ? `Reduces auto-click speed by ${effect.severity * 100}%`
                              : effect.type === "combo"
                                ? "Blocks combo system"
                                : effect.type === "passive"
                                  ? "Blocks passive income"
                                  : `Reduces all income by ${effect.severity * 100}%`
                        : effect.description}
                    </div>
                    {effect.timeRemaining !== undefined && effect.timeRemaining > 0 && (
                      <div className="text-xs mt-1" style={{ color: primaryColor }}>
                        {language === "en" ? "Time left" : "Залишилось"}: {effect.timeRemaining}s
                      </div>
                    )}
                  </div>
                  <button
                    className={cn(
                      "rounded-sm border px-3 py-1 text-xs font-bold uppercase",
                      money < effect.fixCost && "opacity-50",
                    )}
                    style={{
                      borderColor: money >= effect.fixCost ? primaryColor : `${primaryColor}50`,
                      color: money >= effect.fixCost ? primaryColor : `${primaryColor}50`,
                    }}
                    onClick={() => money >= effect.fixCost && onFixEffect(effect.id)}
                    disabled={money < effect.fixCost}
                  >
                    {language === "en" ? "Fix" : "Виправити"} ¥{formatNumber(effect.fixCost)}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
