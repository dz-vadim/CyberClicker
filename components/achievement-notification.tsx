"use client"

import { motion } from "framer-motion"
import { Award } from "lucide-react"

interface AchievementNotificationProps {
  text: string
  primaryColor: string
  secondaryColor: string
}

export default function AchievementNotification({ text, primaryColor, secondaryColor }: AchievementNotificationProps) {
  return (
    <motion.div
      className="fixed left-1/2 top-10 z-50 flex -translate-x-1/2 items-center gap-3 rounded-sm border-2 bg-black/80 px-4 py-3"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      style={{
        borderColor: primaryColor,
        boxShadow: `0 0 15px ${primaryColor}80`,
      }}
    >
      <Award className="h-6 w-6" style={{ color: secondaryColor }} />
      <div className="font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
        {text}
      </div>
    </motion.div>
  )
}
