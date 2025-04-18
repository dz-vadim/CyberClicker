"use client"

import { useMemo } from "react"
import ProgressBar from "./progress-bar"

interface UpgradeProgressProps {
  upgrades: Record<string, { level: number; category: string }>
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: "en" | "uk"
}

// Define the requirements for each category
const ADVANCED_REQUIREMENTS = {
  doubleValue: 15,
  autoClicker: 10,
  criticalClick: 5,
  passiveIncome: 1,
}

const SPECIAL_REQUIREMENTS = {
  clickMultiplier: 10,
  autoClickerSpeed: 8,
  clickCombo: 5,
  offlineEarnings: 3,
}

export default function UpgradeProgress({
  upgrades,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: UpgradeProgressProps) {
  // Calculate progress for Advanced category
  const advancedProgress = useMemo(() => {
    const doubleValueLevel = upgrades.doubleValue?.level || 0
    const autoClickerLevel = upgrades.autoClicker?.level || 0
    const criticalClickLevel = upgrades.criticalClick?.level || 0
    const passiveIncomeLevel = upgrades.passiveIncome?.level || 0

    const doubleValueProgress = Math.min(doubleValueLevel / ADVANCED_REQUIREMENTS.doubleValue, 1)
    const autoClickerProgress = Math.min(autoClickerLevel / ADVANCED_REQUIREMENTS.autoClicker, 1)
    const criticalClickProgress = Math.min(criticalClickLevel / ADVANCED_REQUIREMENTS.criticalClick, 1)
    const passiveIncomeProgress = Math.min(passiveIncomeLevel / ADVANCED_REQUIREMENTS.passiveIncome, 1)

    const totalProgress =
      (doubleValueProgress + autoClickerProgress + criticalClickProgress + passiveIncomeProgress) / 4

    return {
      doubleValue: {
        current: doubleValueLevel,
        required: ADVANCED_REQUIREMENTS.doubleValue,
        progress: doubleValueProgress,
      },
      autoClicker: {
        current: autoClickerLevel,
        required: ADVANCED_REQUIREMENTS.autoClicker,
        progress: autoClickerProgress,
      },
      criticalClick: {
        current: criticalClickLevel,
        required: ADVANCED_REQUIREMENTS.criticalClick,
        progress: criticalClickProgress,
      },
      passiveIncome: {
        current: passiveIncomeLevel,
        required: ADVANCED_REQUIREMENTS.passiveIncome,
        progress: passiveIncomeProgress,
      },
      total: totalProgress,
    }
  }, [upgrades])

  // Calculate progress for Special category
  const specialProgress = useMemo(() => {
    const clickMultiplierLevel = upgrades.clickMultiplier?.level || 0
    const autoClickerSpeedLevel = upgrades.autoClickerSpeed?.level || 0
    const clickComboLevel = upgrades.clickCombo?.level || 0
    const offlineEarningsLevel = upgrades.offlineEarnings?.level || 0

    const clickMultiplierProgress = Math.min(clickMultiplierLevel / SPECIAL_REQUIREMENTS.clickMultiplier, 1)
    const autoClickerSpeedProgress = Math.min(autoClickerSpeedLevel / SPECIAL_REQUIREMENTS.autoClickerSpeed, 1)
    const clickComboProgress = Math.min(clickComboLevel / SPECIAL_REQUIREMENTS.clickCombo, 1)
    const offlineEarningsProgress = Math.min(offlineEarningsLevel / SPECIAL_REQUIREMENTS.offlineEarnings, 1)

    const totalProgress =
      (clickMultiplierProgress + autoClickerSpeedProgress + clickComboProgress + offlineEarningsProgress) / 4

    return {
      clickMultiplier: {
        current: clickMultiplierLevel,
        required: SPECIAL_REQUIREMENTS.clickMultiplier,
        progress: clickMultiplierProgress,
      },
      autoClickerSpeed: {
        current: autoClickerSpeedLevel,
        required: SPECIAL_REQUIREMENTS.autoClickerSpeed,
        progress: autoClickerSpeedProgress,
      },
      clickCombo: { current: clickComboLevel, required: SPECIAL_REQUIREMENTS.clickCombo, progress: clickComboProgress },
      offlineEarnings: {
        current: offlineEarningsLevel,
        required: SPECIAL_REQUIREMENTS.offlineEarnings,
        progress: offlineEarningsProgress,
      },
      total: totalProgress,
    }
  }, [upgrades])

  // Check if Advanced is unlocked
  const isAdvancedUnlocked = useMemo(() => {
    return (
      advancedProgress.doubleValue.progress === 1 &&
      advancedProgress.autoClicker.progress === 1 &&
      advancedProgress.criticalClick.progress === 1 &&
      advancedProgress.passiveIncome.progress === 1
    )
  }, [advancedProgress])

  // Check if Special is unlocked
  const isSpecialUnlocked = useMemo(() => {
    return (
      isAdvancedUnlocked &&
      specialProgress.clickMultiplier.progress === 1 &&
      specialProgress.autoClickerSpeed.progress === 1 &&
      specialProgress.clickCombo.progress === 1 &&
      specialProgress.offlineEarnings.progress === 1
    )
  }, [isAdvancedUnlocked, specialProgress])

  return (
    <div className="mb-4 space-y-3">
      {/* Advanced progress */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="text-xs font-bold" style={{ color: secondaryColor }}>
            {language === "en" ? "Advanced Progress" : "Прогрес просунутих"}
          </div>
          <div className="text-xs" style={{ color: isAdvancedUnlocked ? accentColor : secondaryColor }}>
            {isAdvancedUnlocked
              ? language === "en"
                ? "Unlocked"
                : "Розблоковано"
              : language === "en"
                ? "Locked"
                : "Заблоковано"}
          </div>
        </div>
        <ProgressBar
          value={advancedProgress.total * 100}
          maxValue={100}
          primaryColor={primaryColor}
          secondaryColor={`${secondaryColor}40`}
          height={6}
        />
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
          <div className="text-xs flex justify-between">
            <span style={{ color: secondaryColor }}>Click Value:</span>
            <span style={{ color: advancedProgress.doubleValue.progress === 1 ? accentColor : primaryColor }}>
              {advancedProgress.doubleValue.current}/{ADVANCED_REQUIREMENTS.doubleValue}
            </span>
          </div>
          <div className="text-xs flex justify-between">
            <span style={{ color: secondaryColor }}>Auto Hack:</span>
            <span style={{ color: advancedProgress.autoClicker.progress === 1 ? accentColor : primaryColor }}>
              {advancedProgress.autoClicker.current}/{ADVANCED_REQUIREMENTS.autoClicker}
            </span>
          </div>
          <div className="text-xs flex justify-between">
            <span style={{ color: secondaryColor }}>Critical Hack:</span>
            <span style={{ color: advancedProgress.criticalClick.progress === 1 ? accentColor : primaryColor }}>
              {advancedProgress.criticalClick.current}/{ADVANCED_REQUIREMENTS.criticalClick}
            </span>
          </div>
          <div className="text-xs flex justify-between">
            <span style={{ color: secondaryColor }}>Passive Income:</span>
            <span style={{ color: advancedProgress.passiveIncome.progress === 1 ? accentColor : primaryColor }}>
              {advancedProgress.passiveIncome.current}/{ADVANCED_REQUIREMENTS.passiveIncome}
            </span>
          </div>
        </div>
      </div>

      {/* Special progress (only show if Advanced is unlocked) */}
      {isAdvancedUnlocked && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold" style={{ color: secondaryColor }}>
              {language === "en" ? "Special Progress" : "Прогрес спеціальних"}
            </div>
            <div className="text-xs" style={{ color: isSpecialUnlocked ? accentColor : secondaryColor }}>
              {isSpecialUnlocked
                ? language === "en"
                  ? "Unlocked"
                  : "Розблоковано"
                : language === "en"
                  ? "Locked"
                  : "Заблоковано"}
            </div>
          </div>
          <ProgressBar
            value={specialProgress.total * 100}
            maxValue={100}
            primaryColor={accentColor}
            secondaryColor={`${secondaryColor}40`}
            height={6}
          />
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
            <div className="text-xs flex justify-between">
              <span style={{ color: secondaryColor }}>Click Multiplier:</span>
              <span style={{ color: specialProgress.clickMultiplier.progress === 1 ? accentColor : primaryColor }}>
                {specialProgress.clickMultiplier.current}/{SPECIAL_REQUIREMENTS.clickMultiplier}
              </span>
            </div>
            <div className="text-xs flex justify-between">
              <span style={{ color: secondaryColor }}>Auto Speed:</span>
              <span style={{ color: specialProgress.autoClickerSpeed.progress === 1 ? accentColor : primaryColor }}>
                {specialProgress.autoClickerSpeed.current}/{SPECIAL_REQUIREMENTS.autoClickerSpeed}
              </span>
            </div>
            <div className="text-xs flex justify-between">
              <span style={{ color: secondaryColor }}>Click Combo:</span>
              <span style={{ color: specialProgress.clickCombo.progress === 1 ? accentColor : primaryColor }}>
                {specialProgress.clickCombo.current}/{SPECIAL_REQUIREMENTS.clickCombo}
              </span>
            </div>
            <div className="text-xs flex justify-between">
              <span style={{ color: secondaryColor }}>Offline Earnings:</span>
              <span style={{ color: specialProgress.offlineEarnings.progress === 1 ? accentColor : primaryColor }}>
                {specialProgress.offlineEarnings.current}/{SPECIAL_REQUIREMENTS.offlineEarnings}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
