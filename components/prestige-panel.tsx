"use client"

import { useState } from "react"
import { Award, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { calculateRobocoinsGain } from "@/utils/prestige-system"
import type { Language } from "@/utils/language"

interface PrestigePanelProps {
  totalEarned: number
  robocoins: number
  onPrestige: () => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}

export default function PrestigePanel({
  totalEarned,
  robocoins,
  onPrestige,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: PrestigePanelProps) {
  const [expanded, setExpanded] = useState(false)
  const potentialRobocoins = calculateRobocoinsGain(totalEarned)
  const bonusMultiplier = 1 + robocoins * 0.1 // 10% per robocoin

  return (
    <div className="w-full mb-4">
      <div
        className="mb-2 flex cursor-pointer items-center justify-between rounded-sm border-2 p-2"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 10px ${primaryColor}40`,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" style={{ color: primaryColor }} />
          <span className="font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
            {language === "en" ? "Prestige" : "Престиж"}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5" style={{ color: secondaryColor }} />
        ) : (
          <ChevronDown className="h-5 w-5" style={{ color: secondaryColor }} />
        )}
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
            <div
              className="rounded-sm border-2 p-4"
              style={{
                borderColor: secondaryColor,
                boxShadow: `0 0 10px ${secondaryColor}40`,
              }}
            >
              <div className="mb-4 text-center text-sm" style={{ color: secondaryColor }}>
                {language === "en"
                  ? "Reset your progress to earn Robocoins. Each Robocoin gives +10% to all income."
                  : "Скиньте прогрес, щоб отримати Робокоїни. Кожен Робокоїн дає +10% до всього доходу."}
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: secondaryColor }}>
                    {language === "en" ? "Current Robocoins" : "Поточні Робокоїни"}:
                  </span>
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {robocoins.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: secondaryColor }}>
                    {language === "en" ? "Current bonus" : "Поточний бонус"}:
                  </span>
                  <span className="font-bold" style={{ color: primaryColor }}>
                    +{((bonusMultiplier - 1) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: secondaryColor }}>
                    {language === "en" ? "Robocoins on reset" : "Робокоїни при скиданні"}:
                  </span>
                  <span className="font-bold" style={{ color: accentColor }}>
                    +{potentialRobocoins.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: secondaryColor }}>
                    {language === "en" ? "New total bonus" : "Новий загальний бонус"}:
                  </span>
                  <span className="font-bold" style={{ color: accentColor }}>
                    +{((bonusMultiplier - 1 + potentialRobocoins * 0.1) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <button
                className={cn(
                  "w-full rounded-sm border-2 py-2 font-bold uppercase tracking-wider transition-all",
                  potentialRobocoins < 0.01 && "opacity-50",
                )}
                style={{
                  borderColor: potentialRobocoins >= 0.01 ? accentColor : `${accentColor}50`,
                  color: potentialRobocoins >= 0.01 ? accentColor : `${accentColor}50`,
                  boxShadow: potentialRobocoins >= 0.01 ? `0 0 10px ${accentColor}40` : "none",
                }}
                onClick={onPrestige}
                disabled={potentialRobocoins < 0.01}
              >
                {language === "en" ? "Prestige for" : "Престиж за"} +{potentialRobocoins.toFixed(2)}{" "}
                {language === "en" ? "Robocoins" : "Робокоїнів"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
