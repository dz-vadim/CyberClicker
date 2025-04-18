"use client"

import type React from "react"
import { Settings } from "lucide-react"
import CyberCard from "./cyber-card"
import Glitch from "./glitch"
import ClickEffect from "./click-effect"
import UpgradeItem from "./upgrade-item"
import SkinSelector from "./skin-selector"
import CaseSystem from "./case-system"
import PrestigePanel from "./prestige-panel"
import AntiEffectsPanel from "./anti-effects-panel"
import UpgradeProgress from "./upgrade-progress"
import Leaderboard from "./leaderboard"
import { formatNumber } from "@/utils/format-number"
import type { UpgradeId, SkinId, TabId, UpgradeCategory } from "@/types/game-types"
import type { AntiEffect } from "@/utils/anti-effects"
import type { Language } from "@/utils/language"
import { translations } from "@/utils/language"
import MusicPlayer from "./music-player"
import { AnimatePresence, motion } from "framer-motion"

interface GameInterfaceProps {
  money: number
  totalEarned: number
  clickCount: number
  moneyPerClick: number
  robocoins: number
  totalRobocoins: number
  prestigeCount: number
  playerName: string
  language: Language
  musicEnabled: boolean
  activeTab: TabId
  activeCategory: UpgradeCategory
  activeSkin: SkinId
  upgrades: Record<string, any>
  skins: Record<string, any>
  activeAntiEffects: AntiEffect[]
  unlockedCases: string[]
  clickEffects: string[]
  visualEffects: string[]
  bonusEffects: string[]
  specialEffects: string[]
  showEffect: boolean
  clickPosition: { x: number; y: number }
  showCrit: boolean
  critText: string
  comboCount: number
  comboTimer: number
  showSettings: boolean
  isAdvancedUnlocked: boolean
  isSpecialUnlocked: boolean
  onClickArea: (e: React.MouseEvent) => void
  onToggleSettings: () => void
  onToggleMusic: () => void
  onTabChange: (tab: TabId) => void
  onCategoryChange: (category: UpgradeCategory) => void
  onBuyUpgrade: (upgradeId: UpgradeId) => void
  onBuySkin: (skinId: SkinId) => void
  onApplySkin: (skinId: SkinId) => void
  onWheelSpin: (prize: any) => void
  onCaseOpen: (reward: any) => void
  onPrestige: () => void
  onFixAntiEffect: (effectId: string) => void
  onNameChange: (name: string) => void
  onSaveGame: () => void
  onResetGame: () => void
}

export default function GameInterface({
  money,
  totalEarned,
  clickCount,
  moneyPerClick,
  robocoins,
  totalRobocoins,
  prestigeCount,
  playerName,
  language,
  musicEnabled,
  activeTab,
  activeCategory,
  activeSkin,
  upgrades,
  skins,
  activeAntiEffects,
  unlockedCases,
  clickEffects,
  visualEffects,
  bonusEffects,
  specialEffects,
  showEffect,
  clickPosition,
  showCrit,
  critText,
  comboCount,
  comboTimer,
  showSettings,
  isAdvancedUnlocked,
  isSpecialUnlocked,
  onClickArea,
  onToggleSettings,
  onToggleMusic,
  onTabChange,
  onCategoryChange,
  onBuyUpgrade,
  onBuySkin,
  onApplySkin,
  onWheelSpin,
  onCaseOpen,
  onPrestige,
  onFixAntiEffect,
  onNameChange,
  onSaveGame,
  onResetGame,
}: GameInterfaceProps) {
  const currentSkin = skins[activeSkin]
  const t = translations[language]

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto select-none">
      {/* Header */}
      <header className="mb-6 text-center">
        <Glitch className="text-4xl md:text-5xl font-bold mb-2" style={{ color: currentSkin.colors.primary }}>
          {t.title}
        </Glitch>
        <div className="text-sm md:text-base" style={{ color: currentSkin.colors.secondary }}>
          {t.subtitle}
        </div>
      </header>

      {/* Main game area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Left column - Stats */}
        <div className="flex flex-col gap-4">
          <CyberCard
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
            className="flex flex-col items-center"
          >
            <div className="text-sm mb-2" style={{ color: currentSkin.colors.secondary }}>
              {t.earned}
            </div>
            <div className="text-3xl font-bold mb-4" style={{ color: currentSkin.colors.primary }}>
              ¥{formatNumber(money)}
            </div>
            <div className="text-xs" style={{ color: currentSkin.colors.secondary }}>
              {t.totalHacks}: {formatNumber(clickCount)}
            </div>
          </CyberCard>

          {/* Prestige panel */}
          <PrestigePanel
            totalEarned={totalEarned}
            robocoins={robocoins}
            onPrestige={onPrestige}
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
            accentColor={currentSkin.colors.accent}
            language={language}
          />

          {/* Anti-effects panel */}
          <AntiEffectsPanel
            activeEffects={activeAntiEffects}
            money={money}
            onFixEffect={onFixAntiEffect}
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
            accentColor={currentSkin.colors.accent}
            language={language}
          />

          {/* Upgrade progress */}
          <UpgradeProgress
            upgrades={upgrades}
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
            accentColor={currentSkin.colors.accent}
            language={language}
          />
        </div>

        {/* Middle column - Click area */}
        <div className="flex flex-col gap-4">
          <div
            className="relative flex-1 min-h-[300px] rounded-sm border-2 flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              borderColor: currentSkin.colors.secondary,
              boxShadow: `0 0 15px ${currentSkin.colors.secondary}40`,
              backgroundColor: `${currentSkin.colors.background}80`,
            }}
            onClick={onClickArea}
          >
            {/* Click effects */}
            {showEffect && (
              <ClickEffect
                x={clickPosition.x}
                y={clickPosition.y}
                colors={[currentSkin.colors.primary, currentSkin.colors.secondary, currentSkin.colors.accent]}
                effects={clickEffects}
              />
            )}

            {/* Critical text */}
            <AnimatePresence>
              {showCrit && (
                <motion.div
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl whitespace-nowrap"
                  style={{ color: currentSkin.colors.accent }}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -20, scale: 1 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5 }}
                >
                  {critText}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Combo counter */}
            {comboCount > 1 && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
                style={{ color: currentSkin.colors.accent }}
              >
                <div className="text-xl font-bold">x{comboCount}</div>
                <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(comboTimer / 3) * 100}%`,
                      backgroundColor: currentSkin.colors.accent,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Click value */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: currentSkin.colors.primary }}>
                ¥{formatNumber(moneyPerClick)}
              </div>
              <div className="text-sm" style={{ color: currentSkin.colors.secondary }}>
                {language === "en" ? "per click" : "за клік"}
              </div>
            </div>
          </div>

          {/* Robocoins display */}
          {robocoins > 0 && (
            <CyberCard
              primaryColor={currentSkin.colors.accent}
              secondaryColor={currentSkin.colors.secondary}
              className="flex items-center justify-between"
            >
              <div>
                <div className="text-sm" style={{ color: currentSkin.colors.secondary }}>
                  {t.robocoins}
                </div>
                <div className="text-xl font-bold" style={{ color: currentSkin.colors.accent }}>
                  {robocoins.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm" style={{ color: currentSkin.colors.secondary }}>
                  {t.prestigeBonus}
                </div>
                <div className="text-xl font-bold" style={{ color: currentSkin.colors.accent }}>
                  +{(robocoins * 0.1 * 100).toFixed(0)}%
                </div>
              </div>
            </CyberCard>
          )}
        </div>

        {/* Right column - Tabs */}
        <div className="flex flex-col gap-4">
          {/* Tab navigation */}
          <div className="grid grid-cols-4 gap-1">
            {["upgrades", "skins", "cases", "leaderboard"].map((tab) => (
              <button
                key={tab}
                className={`py-2 text-xs uppercase font-bold transition-all border-b-2 ${
                  activeTab === tab ? "border-opacity-100" : "border-opacity-30 hover:border-opacity-60"
                }`}
                style={{
                  borderColor: currentSkin.colors.primary,
                  color: activeTab === tab ? currentSkin.colors.primary : currentSkin.colors.secondary,
                }}
                onClick={() => onTabChange(tab as TabId)}
              >
                {tab === "leaderboard"
                  ? language === "en"
                    ? "Leaders"
                    : "Лідери"
                  : translations[language][tab as keyof typeof translations.en]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <CyberCard
            primaryColor={currentSkin.colors.primary}
            secondaryColor={currentSkin.colors.secondary}
            className="flex-1 min-h-[400px] overflow-y-auto cyber-scrollbar"
          >
            {/* Upgrades tab */}
            {activeTab === "upgrades" && (
              <div className="space-y-4">
                {/* Category navigation */}
                <div className="grid grid-cols-3 gap-1 mb-4">
                  <button
                    className={`py-1 text-xs uppercase font-bold transition-all border-b-2 ${
                      activeCategory === "basic" ? "border-opacity-100" : "border-opacity-30 hover:border-opacity-60"
                    }`}
                    style={{
                      borderColor: currentSkin.colors.secondary,
                      color:
                        activeCategory === "basic" ? currentSkin.colors.secondary : `${currentSkin.colors.secondary}80`,
                    }}
                    onClick={() => onCategoryChange("basic")}
                  >
                    {t.basic}
                  </button>
                  <button
                    className={`py-1 text-xs uppercase font-bold transition-all border-b-2 ${
                      activeCategory === "advanced" ? "border-opacity-100" : "border-opacity-30 hover:border-opacity-60"
                    } ${!isAdvancedUnlocked && "opacity-50 cursor-not-allowed"}`}
                    style={{
                      borderColor: currentSkin.colors.secondary,
                      color:
                        activeCategory === "advanced"
                          ? currentSkin.colors.secondary
                          : `${currentSkin.colors.secondary}80`,
                    }}
                    onClick={() => isAdvancedUnlocked && onCategoryChange("advanced")}
                    disabled={!isAdvancedUnlocked}
                  >
                    {t.advanced}
                  </button>
                  <button
                    className={`py-1 text-xs uppercase font-bold transition-all border-b-2 ${
                      activeCategory === "special" ? "border-opacity-100" : "border-opacity-30 hover:border-opacity-60"
                    } ${!isSpecialUnlocked && "opacity-50 cursor-not-allowed"}`}
                    style={{
                      borderColor: currentSkin.colors.secondary,
                      color:
                        activeCategory === "special"
                          ? currentSkin.colors.secondary
                          : `${currentSkin.colors.secondary}80`,
                    }}
                    onClick={() => isSpecialUnlocked && onCategoryChange("special")}
                    disabled={!isSpecialUnlocked}
                  >
                    {t.special}
                  </button>
                </div>

                {/* Upgrades grid */}
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(upgrades)
                    .filter(([_, upgrade]) => upgrade.category === activeCategory)
                    .map(([id, upgrade]) => {
                      const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level))
                      const canAfford = money >= cost

                      return (
                        <UpgradeItem
                          key={id}
                          name={upgrade.name}
                          description={upgrade.description}
                          icon={upgrade.icon}
                          level={upgrade.level}
                          cost={cost}
                          canAfford={canAfford}
                          onClick={() => onBuyUpgrade(id as UpgradeId)}
                          primaryColor={currentSkin.colors.primary}
                          secondaryColor={currentSkin.colors.secondary}
                          accentColor={currentSkin.colors.accent}
                          formatNumber={formatNumber}
                        />
                      )
                    })}
                </div>
              </div>
            )}

            {/* Skins tab */}
            {activeTab === "skins" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(skins).map(([id, skin]) => {
                  const isUnlockable = skin.unlockRequirement === null || skins[skin.unlockRequirement].owned
                  return (
                    <SkinSelector
                      key={id}
                      name={skin.name}
                      description={skin.description}
                      cost={skin.cost}
                      owned={skin.owned}
                      isActive={activeSkin === id}
                      canAfford={money >= skin.cost}
                      isUnlockable={isUnlockable}
                      onBuy={() => onBuySkin(id as SkinId)}
                      onApply={() => onApplySkin(id as SkinId)}
                      colors={skin.colors}
                      primaryColor={currentSkin.colors.primary}
                      secondaryColor={currentSkin.colors.secondary}
                      prerequisite={skin.unlockRequirement ? skins[skin.unlockRequirement].name : null}
                    />
                  )
                })}
              </div>
            )}

            {/* Cases tab */}
            {activeTab === "cases" && (
              <CaseSystem
                onOpen={onCaseOpen}
                money={money}
                onSpendMoney={(amount) => {
                  // This is handled in the parent component
                }}
                primaryColor={currentSkin.colors.primary}
                secondaryColor={currentSkin.colors.secondary}
                accentColor={currentSkin.colors.accent}
                unlockedCases={unlockedCases}
              />
            )}

            {/* Leaderboard tab */}
            {activeTab === "leaderboard" && (
              <Leaderboard
                playerName={playerName}
                playerScore={totalEarned}
                playerPrestige={prestigeCount}
                onNameChange={onNameChange}
                primaryColor={currentSkin.colors.primary}
                secondaryColor={currentSkin.colors.secondary}
                accentColor={currentSkin.colors.accent}
              />
            )}
          </CyberCard>
        </div>
      </div>

      {/* Settings and music buttons */}
      <div className="fixed right-4 top-4 z-40 flex gap-2">
        <MusicPlayer
          enabled={musicEnabled}
          onToggle={onToggleMusic}
          primaryColor={currentSkin.colors.primary}
          secondaryColor={currentSkin.colors.secondary}
        />

        <button
          className="flex h-10 w-10 items-center justify-center rounded-sm border-2 bg-black/50"
          style={{
            borderColor: currentSkin.colors.primary,
            color: currentSkin.colors.primary,
            boxShadow: `0 0 10px ${currentSkin.colors.primary}40`,
          }}
          onClick={onToggleSettings}
          title={language === "en" ? "Settings" : "Налаштування"}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
