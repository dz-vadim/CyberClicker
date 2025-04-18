"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Check, Palette } from "lucide-react"
import type { Language } from "@/utils/language"

interface CustomThemeCreatorProps {
  onClose: () => void
  onSave: (
    name: string,
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
    },
  ) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}

export default function CustomThemeCreator({
  onClose,
  onSave,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: CustomThemeCreatorProps) {
  const [themeName, setThemeName] = useState("")
  const [colors, setColors] = useState({
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    background: "#000000",
  })

  const handleSave = () => {
    if (!themeName.trim()) {
      alert(language === "en" ? "Please enter a theme name" : "Будь ласка, введіть назву теми")
      return
    }

    onSave(themeName, colors)
  }

  const translations = {
    en: {
      title: "Create Custom Theme",
      name: "Theme Name",
      namePlaceholder: "Enter theme name",
      colors: "Colors",
      primary: "Primary",
      secondary: "Secondary",
      accent: "Accent",
      background: "Background",
      preview: "Preview",
      save: "Save Theme",
      cancel: "Cancel",
    },
    uk: {
      title: "Створити власну тему",
      name: "Назва теми",
      namePlaceholder: "Введіть назву теми",
      colors: "Кольори",
      primary: "Основний",
      secondary: "Вторинний",
      accent: "Акцент",
      background: "Фон",
      preview: "Перегляд",
      save: "Зберегти тему",
      cancel: "Скасувати",
    },
  }

  const t = translations[language]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md rounded-sm border-2 bg-black/90 p-6"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 20px ${primaryColor}80`,
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
            <Palette className="inline-block mr-2 h-5 w-5" />
            {t.title}
          </h2>
          <button className="p-2 rounded-sm hover:bg-black/20" onClick={onClose} style={{ color: secondaryColor }}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme name */}
          <div>
            <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
              {t.name}
            </label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full p-2 bg-black/30 border rounded-sm"
              style={{ borderColor: secondaryColor, color: primaryColor }}
              maxLength={20}
            />
          </div>

          {/* Color pickers */}
          <div>
            <label className="block text-sm mb-2" style={{ color: secondaryColor }}>
              {t.colors}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: secondaryColor }}>
                  {t.primary}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="w-10 h-10 rounded-sm mr-2 border"
                    style={{ borderColor: secondaryColor }}
                  />
                  <input
                    type="text"
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="flex-1 p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: secondaryColor }}>
                  {t.secondary}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="w-10 h-10 rounded-sm mr-2 border"
                    style={{ borderColor: secondaryColor }}
                  />
                  <input
                    type="text"
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="flex-1 p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: secondaryColor }}>
                  {t.accent}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={colors.accent}
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    className="w-10 h-10 rounded-sm mr-2 border"
                    style={{ borderColor: secondaryColor }}
                  />
                  <input
                    type="text"
                    value={colors.accent}
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    className="flex-1 p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: secondaryColor }}>
                  {t.background}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    value={colors.background}
                    onChange={(e) => setColors({ ...colors, background: e.target.value })}
                    className="w-10 h-10 rounded-sm mr-2 border"
                    style={{ borderColor: secondaryColor }}
                  />
                  <input
                    type="text"
                    value={colors.background}
                    onChange={(e) => setColors({ ...colors, background: e.target.value })}
                    className="flex-1 p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm mb-2" style={{ color: secondaryColor }}>
              {t.preview}
            </label>
            <div
              className="h-20 rounded-sm border-2 p-3"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.background,
                boxShadow: `0 0 10px ${colors.secondary}40`,
              }}
            >
              <div className="flex h-full justify-around items-center">
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.secondary }}></div>
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.accent }}></div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-sm border"
              style={{ borderColor: secondaryColor, color: secondaryColor }}
              onClick={onClose}
            >
              {t.cancel}
            </button>
            <button
              className="px-4 py-2 rounded-sm border flex items-center"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}40`,
              }}
              onClick={handleSave}
            >
              <Check size={18} className="mr-1" />
              {t.save}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
