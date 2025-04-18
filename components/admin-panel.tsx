"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Save, Trash2, Download, Upload, Key, Eye, EyeOff, RefreshCw } from "lucide-react"
import CyberCard from "./cyber-card"
import CyberButton from "./cyber-button"
import type { Language } from "@/utils/language"

// Заменим компонент Documentation на импорт нового компонента
import GameDocumentation from "@/docs/game-documentation"

// Изменим интерфейс компонента, добавив поддержку языка
interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  gameState: any
  onUpdateGameState: (newState: any) => void
  onResetGame: () => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}

// Добавим переводы для админ-панели
const adminTranslations = {
  en: {
    adminPanel: "Admin Panel",
    password: "Administrator Password",
    login: "Login",
    export: "Export",
    import: "Import",
    save: "Save",
    close: "Close",
    general: "General",
    upgrades: "Upgrades",
    skins: "Skins",
    cases: "Cases",
    effects: "Effects",
    docs: "Documentation",
    resetConfirm: "Are you sure you want to reset all game data? This action cannot be undone.",
    cancel: "Cancel",
    reset: "Reset",
    gameEconomy: "Game Economy",
    money: "Money",
    totalEarned: "Total Earned",
    clickCount: "Click Count",
    moneyPerClick: "Money per Click",
    prestigeAndBonuses: "Prestige and Bonuses",
    robocoins: "Robocoins",
    totalRobocoins: "Total Robocoins",
    prestigeCount: "Prestige Count",
    playerName: "Player Name",
    interfaceSettings: "Interface Settings",
    activeSkin: "Active Skin",
    language: "Language",
    musicEnabled: "Music Enabled",
    useDesktopInterface: "Use Desktop Interface",
    desktopInterfaceUnlocked: "Desktop Interface Unlocked",
    dangerZone: "Danger Zone",
    dangerWarning: "These actions can lead to data loss or game malfunction. Use with caution!",
    resetAllData: "Reset All Data",
    unlockAll: "Unlock All",
    maxUpgrades: "Max Upgrades",
    addMoney: "Add 1B Money",
    upgradeSettings: "Upgrade Settings",
    all: "All",
    basic: "Basic",
    advanced: "Advanced",
    special: "Special",
    description: "Description",
    level: "Level",
    baseCost: "Base Cost",
    costMultiplier: "Cost Multiplier",
    effect: "Effect",
    effectMultiplier: "Effect Multiplier",
    category: "Category",
    owned: "Owned",
    skinSettings: "Skin Settings",
    name: "Name",
    cost: "Cost",
    requirement: "Requirement",
    none: "None",
    colors: "Colors",
    primary: "Primary",
    secondary: "Secondary",
    accent: "Accent",
    background: "Background",
    caseSettings: "Case Settings",
    unlockedCases: "Unlocked Cases",
    basicCase: "Basic Case",
    premiumCase: "Premium Case",
    eliteCase: "Elite Case",
    legendaryCase: "Legendary Case",
    resetAll: "Reset All",
    selectAll: "Select All",
    caseInfo: "Case Information",
    basicCaseDesc: "Cost: 5,000 credits\nContains common rewards with a small chance for something special.",
    premiumCaseDesc: "Cost: 25,000 credits\nContains better rewards with higher chances for rare items.",
    eliteCaseDesc: "Cost: 100,000 credits\nContains high-quality rewards with guaranteed rare or better items.",
    legendaryCaseDesc: "Cost: 500,000 credits\nContains the best rewards with a chance for legendary items.",
    effectSettings: "Effect Settings",
    clickEffects: "Click Effects",
    visualEffects: "Visual Effects",
    bonusEffects: "Bonus Effects",
    specialEffects: "Special Effects",
    documentation: "Cyber Clicker Documentation",
    generalInfo: "General Information",
    gameDescription:
      "Cyber Clicker is a cyberpunk-style clicker game where players earn virtual credits by clicking on the screen and purchasing various upgrades to increase income.",
    gameObjective:
      "The main goal of the game is to earn as many credits as possible, unlock all upgrades and skins, and achieve a high prestige level to gain Robocoins.",
  },
  uk: {
    adminPanel: "Адмін-панель",
    password: "Пароль адміністратора",
    login: "Увійти",
    export: "Експорт",
    import: "Імпорт",
    save: "Зберегти",
    close: "Закрити",
    general: "Загальні",
    upgrades: "Покращення",
    skins: "Скіни",
    cases: "Кейси",
    effects: "Ефекти",
    docs: "Документація",
    resetConfirm: "Ви впевнені, що хочете скинути всі дані гри? Цю дію неможливо скасувати.",
    cancel: "Скасувати",
    reset: "Скинути",
    gameEconomy: "Ігрова економіка",
    money: "Гроші",
    totalEarned: "Всього зароблено",
    clickCount: "Кількість кліків",
    moneyPerClick: "Грошей за клік",
    prestigeAndBonuses: "Престиж та бонуси",
    robocoins: "Робокоїни",
    totalRobocoins: "Всього робокоїнів",
    prestigeCount: "Кількість престижів",
    playerName: "Ім'я гравця",
    interfaceSettings: "Налаштування інтерфейсу",
    activeSkin: "Активний скін",
    language: "Мова",
    musicEnabled: "Музика увімкнена",
    useDesktopInterface: "Використовувати десктопний інтерфейс",
    desktopInterfaceUnlocked: "Десктопний інтерфейс розблоковано",
    dangerZone: "Небезпечна зона",
    dangerWarning: "Ці дії можуть призвести до втрати даних або порушення роботи гри. Використовуйте з обережністю!",
    resetAllData: "Скинути всі дані",
    unlockAll: "Розблокувати все",
    maxUpgrades: "Макс. покращення",
    addMoney: "Додати 1B грошей",
    upgradeSettings: "Налаштування покращень",
    all: "Всі",
    basic: "Базові",
    advanced: "Просунуті",
    special: "Спеціальні",
    description: "Опис",
    level: "Рівень",
    baseCost: "Базова вартість",
    costMultiplier: "Множник вартості",
    effect: "Ефект",
    effectMultiplier: "Множник ефекту",
    category: "Категорія",
    owned: "Придбано",
    skinSettings: "Налаштування скінів",
    name: "Назва",
    cost: "Вартість",
    requirement: "Вимога",
    none: "Немає",
    colors: "Кольори",
    primary: "Основний",
    secondary: "Вторинний",
    accent: "Акцент",
    background: "Фон",
    caseSettings: "Налаштування кейсів",
    unlockedCases: "Розблоковані кейси",
    basicCase: "Базовий кейс",
    premiumCase: "Преміум кейс",
    eliteCase: "Елітний кейс",
    legendaryCase: "Легендарний кейс",
    resetAll: "Скинути все",
    selectAll: "Вибрати все",
    caseInfo: "Інформація про кейси",
    basicCaseDesc: "Вартість: 5,000 кредитів\nМістить звичайні нагороди з невеликим шансом на щось особливе.",
    premiumCaseDesc: "Вартість: 25,000 кредитів\nМістить кращі нагороди з вищими шансами на рідкісні предмети.",
    eliteCaseDesc:
      "Вартість: 100,000 кредитів\nМістить високоякісні нагороди з гарантованими рідкісними або кращими предметами.",
    legendaryCaseDesc: "Вартість: 500,000 кредитів\nМістить найкращі нагороди з шансом на легендарні предмети.",
    effectSettings: "Налаштування ефектів",
    clickEffects: "Ефекти кліку",
    visualEffects: "Візуальні ефекти",
    bonusEffects: "Бонусні ефекти",
    specialEffects: "Спеціальні ефекти",
    documentation: "Документація Cyber Clicker",
    generalInfo: "Загальна інформація",
    gameDescription:
      "Cyber Clicker - це гра-клікер у кіберпанк стилі, де гравці заробляють віртуальні кредити, клікаючи по екрану та купуючи різні покращення для збільшення доходу.",
    gameObjective:
      "Основна мета гри - заробити якомога більше кредитів, розблокувати всі покращення та скіни, і досягти високого рівня престижу для отримання Робокоїнів.",
  },
}

export default function AdminPanel({
  isOpen,
  onClose,
  gameState,
  onUpdateGameState,
  onResetGame,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"general" | "upgrades" | "skins" | "cases" | "effects" | "docs">("general")
  const [editedState, setEditedState] = useState<any>(gameState)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [showImportExport, setShowImportExport] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // В функции AdminPanel добавим:
  const t = adminTranslations[language]

  // Обновляем локальное состояние при изменении gameState
  useEffect(() => {
    setEditedState(gameState)
  }, [gameState])

  // Аутентификация
  const authenticate = () => {
    // В реальном приложении здесь должна быть настоящая проверка пароля
    // Для демонстрации используем простой пароль "admin123"
    if (adminPassword === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("admin_authenticated", "true")
    } else {
      alert("Incorrect password!")
    }
  }

  // Проверяем сохраненную аутентификацию при загрузке
  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_authenticated")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Выход из админ-панели
  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    onClose()
  }

  // Обработчики изменений
  const handleGeneralChange = (key: string, value: any) => {
    setEditedState((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleUpgradeChange = (upgradeId: string, field: string, value: any) => {
    setEditedState((prev: any) => ({
      ...prev,
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: {
          ...prev.upgrades[upgradeId],
          [field]: value,
        },
      },
    }))
  }

  const handleSkinChange = (skinId: string, field: string, value: any) => {
    setEditedState((prev: any) => ({
      ...prev,
      skins: {
        ...prev.skins,
        [skinId]: {
          ...prev.skins[skinId],
          [field]: field === "colors" ? { ...prev.skins[skinId].colors, ...value } : value,
        },
      },
    }))
  }

  // Сохранение изменений
  const saveChanges = () => {
    onUpdateGameState(editedState)
    alert("Changes saved!")
  }

  // Экспорт/импорт данных
  const exportGameData = () => {
    try {
      const dataStr = JSON.stringify(gameState, null, 2)
      setExportData(dataStr)
      setShowImportExport(true)
    } catch (error) {
      console.error("Export error:", error)
      alert("Error exporting data!")
    }
  }

  const importGameData = () => {
    try {
      const newData = JSON.parse(importData)
      onUpdateGameState(newData)
      setShowImportExport(false)
      setImportData("")
      alert("Data successfully imported!")
    } catch (error) {
      console.error("Import error:", error)
      alert("Error importing data! Check JSON format.")
    }
  }

  // Если панель закрыта, не рендерим ничего
  if (!isOpen) return null

  // Если не аутентифицирован, показываем форму входа
  if (!isAuthenticated) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
              {t.adminPanel}
            </h2>
            <button className="p-2 rounded-sm hover:bg-black/20" onClick={onClose} style={{ color: secondaryColor }}>
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm" style={{ color: secondaryColor }}>
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: secondaryColor, color: primaryColor }}
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: secondaryColor }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <CyberButton onClick={authenticate} primaryColor={primaryColor} secondaryColor={secondaryColor}>
                <Key size={16} className="mr-2" />
                {t.login}
              </CyberButton>
            </div>
          </div>
        </CyberCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="w-full h-full max-w-7xl max-h-[90vh] flex flex-col rounded-sm border-2 bg-black/95 overflow-hidden"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 20px ${primaryColor}80`,
        }}
      >
        {/* Заголовок */}
        <div
          className="flex justify-between items-center p-4 border-b-2"
          style={{ borderColor: `${secondaryColor}40` }}
        >
          <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
            {t.adminPanel} Cyber Clicker
          </h2>
          <div className="flex gap-2">
            <CyberButton onClick={exportGameData} primaryColor={accentColor} className="text-sm py-1">
              <Download size={16} className="mr-1" />
              {t.export}
            </CyberButton>
            <CyberButton
              onClick={() => setShowImportExport(true)}
              primaryColor={secondaryColor}
              className="text-sm py-1"
            >
              <Upload size={16} className="mr-1" />
              {t.import}
            </CyberButton>
            <CyberButton onClick={saveChanges} primaryColor={primaryColor} className="text-sm py-1">
              <Save size={16} className="mr-1" />
              {t.save}
            </CyberButton>
            <button className="p-2 rounded-sm hover:bg-black/20" onClick={logout} style={{ color: secondaryColor }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Навигация */}
        <div className="flex border-b-2" style={{ borderColor: `${secondaryColor}40` }}>
          {["general", "upgrades", "skins", "cases", "effects", "docs"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-bold uppercase transition-all border-b-2 ${
                activeTab === tab ? "border-opacity-100" : "border-opacity-0 hover:border-opacity-50"
              }`}
              style={{
                borderColor: primaryColor,
                color: activeTab === tab ? primaryColor : secondaryColor,
              }}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab === "general"
                ? t.general
                : tab === "upgrades"
                  ? t.upgrades
                  : tab === "skins"
                    ? t.skins
                    : tab === "cases"
                      ? t.cases
                      : tab === "effects"
                        ? t.effects
                        : t.docs}
            </button>
          ))}
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-auto p-4 cyber-scrollbar">
          {activeTab === "general" && (
            <GeneralSettings
              state={editedState}
              onChange={handleGeneralChange}
              onReset={() => setShowConfirmReset(true)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "upgrades" && (
            <UpgradesSettings
              upgrades={editedState.upgrades}
              onChange={handleUpgradeChange}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "skins" && (
            <SkinsSettings
              skins={editedState.skins}
              onChange={handleSkinChange}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "cases" && (
            <CasesSettings
              unlockedCases={editedState.unlockedCases}
              onChange={(cases) => handleGeneralChange("unlockedCases", cases)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "effects" && (
            <EffectsSettings
              clickEffects={editedState.clickEffects || []}
              visualEffects={editedState.visualEffects || []}
              bonusEffects={editedState.bonusEffects || []}
              specialEffects={editedState.specialEffects || []}
              onChange={(type, effects) => handleGeneralChange(`${type}Effects`, effects)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "docs" && (
            <Documentation
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения сброса */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
              {t.resetConfirm}
            </h3>
            <p className="mb-6" style={{ color: secondaryColor }}>
              {t.resetConfirm}
            </p>
            <div className="flex justify-end gap-4">
              <CyberButton onClick={() => setShowConfirmReset(false)} primaryColor={secondaryColor}>
                {t.cancel}
              </CyberButton>
              <CyberButton
                onClick={() => {
                  onResetGame()
                  setShowConfirmReset(false)
                }}
                primaryColor="#ff0000"
              >
                <Trash2 size={16} className="mr-2" />
                {t.reset}
              </CyberButton>
            </div>
          </CyberCard>
        </div>
      )}

      {/* Модальное окно импорта/экспорта */}
      {showImportExport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
                {t.import}/{t.export} {t.general}
              </h3>
              <button
                className="p-2 rounded-sm hover:bg-black/20"
                onClick={() => setShowImportExport(false)}
                style={{ color: secondaryColor }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: secondaryColor }}>
                {t.general} JSON
              </label>
              <textarea
                value={exportData || importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-64 p-2 bg-black/30 border rounded-sm font-mono text-sm cyber-scrollbar"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div className="flex justify-end gap-4">
              <CyberButton onClick={() => setShowImportExport(false)} primaryColor={secondaryColor}>
                {t.cancel}
              </CyberButton>
              <CyberButton onClick={importGameData} primaryColor={primaryColor}>
                <Upload size={16} className="mr-2" />
                {t.import}
              </CyberButton>
            </div>
          </CyberCard>
        </div>
      )}
    </motion.div>
  )
}

// Компонент общих настроек
function GeneralSettings({
  state,
  onChange,
  onReset,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  state: any
  onChange: (key: string, value: any) => void
  onReset: () => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const t = adminTranslations[language]

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
        {t.general} {t.general}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.gameEconomy}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.money}
              </label>
              <input
                type="number"
                value={state.money}
                onChange={(e) => onChange("money", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.totalEarned}
              </label>
              <input
                type="number"
                value={state.totalEarned}
                onChange={(e) => onChange("totalEarned", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.clickCount}
              </label>
              <input
                type="number"
                value={state.clickCount}
                onChange={(e) => onChange("clickCount", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.moneyPerClick}
              </label>
              <input
                type="number"
                value={state.moneyPerClick}
                onChange={(e) => onChange("moneyPerClick", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.prestigeAndBonuses}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.robocoins}
              </label>
              <input
                type="number"
                value={state.robocoins}
                onChange={(e) => onChange("robocoins", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.totalRobocoins}
              </label>
              <input
                type="number"
                value={state.totalRobocoins}
                onChange={(e) => onChange("totalRobocoins", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.prestigeCount}
              </label>
              <input
                type="number"
                value={state.prestigeCount}
                onChange={(e) => onChange("prestigeCount", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.playerName}
              </label>
              <input
                type="text"
                value={state.playerName}
                onChange={(e) => onChange("playerName", e.target.value)}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.interfaceSettings}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.activeSkin}
              </label>
              <select
                value={state.activeSkin}
                onChange={(e) => onChange("activeSkin", e.target.value)}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              >
                {Object.keys(state.skins || {}).map((skinId) => (
                  <option key={skinId} value={skinId}>
                    {skinId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t.language}
              </label>
              <select
                value={state.language}
                onChange={(e) => onChange("language", e.target.value)}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              >
                <option value="en">English</option>
                <option value="uk">Українська</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={state.musicEnabled}
                onChange={(e) => onChange("musicEnabled", e.target.checked)}
                id="musicEnabled"
                className="mr-2"
              />
              <label htmlFor="musicEnabled" style={{ color: secondaryColor }}>
                {t.musicEnabled}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={state.useDesktopInterface}
                onChange={(e) => onChange("useDesktopInterface", e.target.checked)}
                id="useDesktopInterface"
                className="mr-2"
              />
              <label htmlFor="useDesktopInterface" style={{ color: secondaryColor }}>
                {t.useDesktopInterface}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={state.desktopInterfaceUnlocked}
                onChange={(e) => onChange("desktopInterfaceUnlocked", e.target.checked)}
                id="desktopInterfaceUnlocked"
                className="mr-2"
              />
              <label htmlFor="desktopInterfaceUnlocked" style={{ color: secondaryColor }}>
                {t.desktopInterfaceUnlocked}
              </label>
            </div>
          </div>
        </CyberCard>

        <CyberCard primaryColor="#ff0000" secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: "#ff0000" }}>
            {t.dangerZone}
          </h4>

          <div className="space-y-4">
            <p style={{ color: secondaryColor }}>{t.dangerWarning}</p>

            <div className="flex justify-between">
              <CyberButton onClick={onReset} primaryColor="#ff0000">
                <Trash2 size={16} className="mr-2" />
                {t.resetAllData}
              </CyberButton>

              <CyberButton
                onClick={() => {
                  const newState = { ...state }
                  // Разблокировать все скины
                  Object.keys(newState.skins).forEach((skinId) => {
                    newState.skins[skinId].owned = true
                  })
                  // Разблокировать все кейсы
                  newState.unlockedCases = ["basic", "premium", "elite", "legendary"]
                  // Разблокировать десктопный интерфейс
                  newState.desktopInterfaceUnlocked = true
                  onChange("", newState)
                }}
                primaryColor={accentColor}
              >
                <Key size={16} className="mr-2" />
                {t.unlockAll}
              </CyberButton>
            </div>

            <div className="flex justify-between">
              <CyberButton
                onClick={() => {
                  const newState = { ...state }
                  // Максимальные уровни улучшений
                  Object.keys(newState.upgrades).forEach((upgradeId) => {
                    newState.upgrades[upgradeId].level = 100
                    newState.upgrades[upgradeId].owned = true
                  })
                  onChange("", newState)
                }}
                primaryColor={accentColor}
              >
                <RefreshCw size={16} className="mr-2" />
                {t.maxUpgrades}
              </CyberButton>

              <CyberButton
                onClick={() => {
                  onChange("money", 1000000000)
                  onChange("totalEarned", 1000000000)
                }}
                primaryColor={accentColor}
              >
                <RefreshCw size={16} className="mr-2" />
                {t.addMoney}
              </CyberButton>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  )
}

// Компонент настроек улучшений
function UpgradesSettings({
  upgrades,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  upgrades: Record<string, any>
  onChange: (upgradeId: string, field: string, value: any) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const [filter, setFilter] = useState<"all" | "basic" | "advanced" | "special">("all")
  const t = adminTranslations[language]

  const filteredUpgrades = Object.entries(upgrades).filter(([_, upgrade]) => {
    if (filter === "all") return true
    return upgrade.category === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
          {t.upgradeSettings}
        </h3>

        <div className="flex gap-2">
          {["all", "basic", "advanced", "special"].map((category) => (
            <button
              key={category}
              className={`px-3 py-1 text-sm rounded-sm border ${
                filter === category ? "border-opacity-100" : "border-opacity-50"
              }`}
              style={{
                borderColor: primaryColor,
                color: filter === category ? primaryColor : secondaryColor,
                backgroundColor: filter === category ? `${primaryColor}20` : "transparent",
              }}
              onClick={() => setFilter(category as any)}
            >
              {category === "all"
                ? t.all
                : category === "basic"
                  ? t.basic
                  : category === "advanced"
                    ? t.advanced
                    : t.special}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUpgrades.map(([upgradeId, upgrade]) => (
          <CyberCard key={upgradeId} primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
            <h4 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
              {upgrade.name} ({upgradeId})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                  {t.description}
                </label>
                <input
                  type="text"
                  value={upgrade.description}
                  onChange={(e) => onChange(upgradeId, "description", e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: secondaryColor, color: primaryColor }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t.level}
                  </label>
                  <input
                    type="number"
                    value={upgrade.level}
                    onChange={(e) => onChange(upgradeId, "level", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t.baseCost}
                  </label>
                  <input
                    type="number"
                    value={upgrade.baseCost}
                    onChange={(e) => onChange(upgradeId, "baseCost", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t.costMultiplier}
                  </label>
                  <input
                    type="number"
                    value={upgrade.costMultiplier}
                    onChange={(e) => onChange(upgradeId, "costMultiplier", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t.effect}
                  </label>
                  <input
                    type="number"
                    value={upgrade.effect}
                    onChange={(e) => onChange(upgradeId, "effect", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t.effectMultiplier}
                  </label>
                  <input
                    type="number"
                    value={upgrade.effectMultiplier}
                    onChange={(e) => onChange(upgradeId, "effectMultiplier", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t.category}
                  </label>
                  <select
                    value={upgrade.category}
                    onChange={(e) => onChange(upgradeId, "category", e.target.value)}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  >
                    <option value="basic">{t.basic}</option>
                    <option value="advanced">{t.advanced}</option>
                    <option value="special">{t.special}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={upgrade.owned}
                  onChange={(e) => onChange(upgradeId, "owned", e.target.checked)}
                  id={`owned-${upgradeId}`}
                  className="mr-2"
                />
                <label htmlFor={`owned-${upgradeId}`} style={{ color: secondaryColor }}>
                  {t.owned}
                </label>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  )
}

// Компонент настроек скинов
function SkinsSettings({
  skins,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  skins: Record<string, any>
  onChange: (skinId: string, field: string, value: any) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const t = adminTranslations[language]

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
        {t.skinSettings}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(skins).map(([skinId, skin]) => (
          <CyberCard
            key={skinId}
            primaryColor={skin.colors.primary}
            secondaryColor={skin.colors.secondary}
            className="p-4"
          >
            <h4 className="text-lg font-bold mb-3" style={{ color: skin.colors.primary }}>
              {skin.name} ({skinId})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={skin.name}
                  onChange={(e) => onChange(skinId, "name", e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                  {t.description}
                </label>
                <input
                  type="text"
                  value={skin.description}
                  onChange={(e) => onChange(skinId, "description", e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                    {t.cost}
                  </label>
                  <input
                    type="number"
                    value={skin.cost}
                    onChange={(e) => onChange(skinId, "cost", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                    {t.requirement}
                  </label>
                  <select
                    value={skin.unlockRequirement || ""}
                    onChange={(e) => onChange(skinId, "unlockRequirement", e.target.value || null)}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                  >
                    <option value="">{t.none}</option>
                    {Object.keys(skins).map((id) => (
                      <option key={id} value={id} disabled={id === skinId}>
                        {skins[id].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: skin.colors.secondary }}>
                  {t.colors}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t.primary}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.primary}
                        onChange={(e) => onChange(skinId, "colors", { primary: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.primary}
                        onChange={(e) => onChange(skinId, "colors", { primary: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t.secondary}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.secondary}
                        onChange={(e) => onChange(skinId, "colors", { secondary: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.secondary}
                        onChange={(e) => onChange(skinId, "colors", { secondary: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t.accent}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.accent}
                        onChange={(e) => onChange(skinId, "colors", { accent: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.accent}
                        onChange={(e) => onChange(skinId, "colors", { accent: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t.background}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.background}
                        onChange={(e) => onChange(skinId, "colors", { background: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.background}
                        onChange={(e) => onChange(skinId, "colors", { background: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={skin.owned}
                  onChange={(e) => onChange(skinId, "owned", e.target.checked)}
                  id={`owned-${skinId}`}
                  className="mr-2"
                />
                <label htmlFor={`owned-${skinId}`} style={{ color: skin.colors.secondary }}>
                  {t.owned}
                </label>
              </div>

              <div className="h-10 rounded-sm mt-2" style={{ backgroundColor: skin.colors.background }}>
                <div className="flex h-full justify-around items-center">
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: skin.colors.primary }}></div>
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: skin.colors.secondary }}></div>
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: skin.colors.accent }}></div>
                </div>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  )
}

// Компонент настроек кейсов
function CasesSettings({
  unlockedCases,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  unlockedCases: string[]
  onChange: (cases: string[]) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const allCases = ["basic", "premium", "elite", "legendary"]
  const t = adminTranslations[language]

  const toggleCase = (caseId: string) => {
    if (unlockedCases.includes(caseId)) {
      onChange(unlockedCases.filter((id) => id !== caseId))
    } else {
      onChange([...unlockedCases, caseId])
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
        {t.caseSettings}
      </h3>

      <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
        <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
          {t.unlockedCases}
        </h4>

        <div className="space-y-3">
          {allCases.map((caseId) => (
            <div key={caseId} className="flex items-center">
              <input
                type="checkbox"
                checked={unlockedCases.includes(caseId)}
                onChange={() => toggleCase(caseId)}
                id={`case-${caseId}`}
                className="mr-2"
              />
              <label htmlFor={`case-${caseId}`} style={{ color: secondaryColor }}>
                {caseId === "basic"
                  ? t.basicCase
                  : caseId === "premium"
                    ? t.premiumCase
                    : caseId === "elite"
                      ? t.eliteCase
                      : t.legendaryCase}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <CyberButton onClick={() => onChange([])} primaryColor={secondaryColor} className="text-sm py-1">
            {t.resetAll}
          </CyberButton>

          <CyberButton onClick={() => onChange(allCases)} primaryColor={accentColor} className="text-sm py-1">
            {t.selectAll}
          </CyberButton>
        </div>
      </CyberCard>

      <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
        <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
          {t.caseInfo}
        </h4>

        <div className="space-y-4">
          <div>
            <h5 className="font-bold mb-2" style={{ color: "#05d9e8" }}>
              {t.basicCase}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t.basicCaseDesc}
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-2" style={{ color: "#ff2a6d" }}>
              {t.premiumCase}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t.premiumCaseDesc}
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-2" style={{ color: "#d300c5" }}>
              {t.eliteCase}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t.eliteCaseDesc}
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-2" style={{ color: "#39ff14" }}>
              {t.legendaryCase}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t.legendaryCaseDesc}
            </p>
          </div>
        </div>
      </CyberCard>
    </div>
  )
}

// Компонент настроек эффектов
function EffectsSettings({
  clickEffects,
  visualEffects,
  bonusEffects,
  specialEffects,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  clickEffects: string[]
  visualEffects: string[]
  bonusEffects: string[]
  specialEffects: string[]
  onChange: (type: string, effects: string[]) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const allEffects = {
    click: [
      { id: "basic-1", name: "Pixel Dust", description: "Adds pixel particles to your clicks" },
      { id: "basic-2", name: "Echo Click", description: "Creates echo ripples when clicking" },
      { id: "premium-1", name: "Plasma Burst", description: "Explosive plasma effect on clicks" },
      { id: "premium-4", name: "Hologram Click", description: "Holographic projection on each click" },
      { id: "elite-1", name: "Quantum Particles", description: "Quantum particle effects on clicks" },
      { id: "elite-4", name: "Fractal Click", description: "Fractal patterns explode from clicks" },
      { id: "legendary-1", name: "Supernova", description: "Cosmic explosion on critical clicks" },
      { id: "legendary-4", name: "Dimensional Rift", description: "Opens rifts in reality when clicking" },
    ],
    visual: [
      { id: "basic-3", name: "Neon Glow", description: "Adds a subtle neon glow to the game" },
      { id: "basic-5", name: "Digital Rain", description: "Matrix-style digital rain in the background" },
      { id: "premium-2", name: "Cyber Grid", description: "Enhanced grid background with animations" },
      { id: "elite-2", name: "Neural Network", description: "Neural network animations in the background" },
      { id: "legendary-2", name: "Reality Glitch", description: "Reality-bending visual glitches" },
    ],
    bonus: [
      { id: "basic-4", name: "Lucky Charm", description: "+5% chance for critical clicks" },
      { id: "premium-3", name: "Credit Boost", description: "+10% credits per click" },
      { id: "elite-3", name: "Efficiency Module", description: "Upgrades cost 15% less" },
      { id: "legendary-3", name: "Golden Touch", description: "+25% credits from all sources" },
    ],
    special: [
      { id: "premium-5", name: "Time Warp", description: "Auto clickers run 20% faster" },
      { id: "elite-5", name: "Temporal Shift", description: "Chance to get double credits randomly" },
      { id: "legendary-5", name: "Time Dilation", description: "Everything runs 30% faster" },
    ],
  }
  const t = adminTranslations[language]

  const toggleEffect = (type: string, effectId: string) => {
    const currentEffects =
      type === "click"
        ? clickEffects
        : type === "visual"
          ? visualEffects
          : type === "bonus"
            ? bonusEffects
            : specialEffects

    if (currentEffects.includes(effectId)) {
      onChange(
        type,
        currentEffects.filter((id) => id !== effectId),
      )
    } else {
      onChange(type, [...currentEffects, effectId])
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
        {t.effectSettings}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.clickEffects}
          </h4>

          <div className="space-y-2">
            {allEffects.click.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={clickEffects.includes(effect.id)}
                  onChange={() => toggleEffect("click", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("click", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t.resetAll}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "click",
                  allEffects.click.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t.selectAll}
            </CyberButton>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.visualEffects}
          </h4>

          <div className="space-y-2">
            {allEffects.visual.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={visualEffects.includes(effect.id)}
                  onChange={() => toggleEffect("visual", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("visual", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t.resetAll}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "visual",
                  allEffects.visual.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t.selectAll}
            </CyberButton>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.bonusEffects}
          </h4>

          <div className="space-y-2">
            {allEffects.bonus.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={bonusEffects.includes(effect.id)}
                  onChange={() => toggleEffect("bonus", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("bonus", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t.resetAll}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "bonus",
                  allEffects.bonus.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t.selectAll}
            </CyberButton>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t.specialEffects}
          </h4>

          <div className="space-y-2">
            {allEffects.special.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={specialEffects.includes(effect.id)}
                  onChange={() => toggleEffect("special", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("special", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t.resetAll}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "special",
                  allEffects.special.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t.selectAll}
            </CyberButton>
          </div>
        </CyberCard>
      </div>
    </div>
  )
}

// И заменим функцию Documentation на:
function Documentation({
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  return (
    <GameDocumentation
      language={language}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      accentColor={accentColor}
    />
  )
}
