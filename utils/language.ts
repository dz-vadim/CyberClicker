export type Language = "en" | "uk"

export type Translations = {
  // Game UI
  title: string
  subtitle: string
  settings: string
  save: string
  reset: string
  close: string

  // Tabs
  upgrades: string
  skins: string
  wheel: string
  cases: string
  leaders: string

  // Categories
  basic: string
  advanced: string
  special: string

  // Stats
  totalHacks: string
  earned: string

  // Prestige
  prestige: string
  prestigeDescription: string
  prestigeButton: string
  robocoins: string
  prestigeBonus: string

  // Anti-effects
  antiEffects: string
  fix: string

  // Settings
  autoSave: string
  lastSaved: string
  playerName: string
  unlockedEffects: string
  language: string
}

export const translations: Record<Language, Translations> = {
  en: {
    title: "Cyber Clicker",
    subtitle: "Hack the system. Earn credits.",
    settings: "Settings",
    save: "Save Game",
    reset: "Reset Game",
    close: "Close",

    upgrades: "Upgrades",
    skins: "Skins",
    wheel: "Wheel",
    cases: "Cases",
    leaders: "Leaders",

    basic: "Basic",
    advanced: "Advanced",
    special: "Special",

    totalHacks: "TOTAL HACKS",
    earned: "EARNED",

    prestige: "Prestige",
    prestigeDescription: "Reset your progress to earn Robocoins. Each Robocoin gives +10% to all income.",
    prestigeButton: "Prestige for",
    robocoins: "Robocoins",
    prestigeBonus: "Current bonus",

    antiEffects: "Active Problems",
    fix: "Fix",

    autoSave: "Auto-save",
    lastSaved: "Last saved",
    playerName: "Player name",
    unlockedEffects: "Unlocked effects",
    language: "Language",
  },
  uk: {
    title: "Кібер Клікер",
    subtitle: "Зламай систему. Заробляй кредити.",
    settings: "Налаштування",
    save: "Зберегти гру",
    reset: "Скинути гру",
    close: "Закрити",

    upgrades: "Покращення",
    skins: "Скіни",
    wheel: "Колесо",
    cases: "Кейси",
    leaders: "Лідери",

    basic: "Базові",
    advanced: "Просунуті",
    special: "Спеціальні",

    totalHacks: "ВСЬОГО ЗЛАМІВ",
    earned: "ЗАРОБЛЕНО",

    prestige: "Престиж",
    prestigeDescription: "Скиньте прогрес, щоб отримати Робокоїни. Кожен Робокоїн дає +10% до всього доходу.",
    prestigeButton: "Престиж за",
    robocoins: "Робокоїнів",
    prestigeBonus: "Поточний бонус",

    antiEffects: "Активні проблеми",
    fix: "Виправити",

    autoSave: "Автозбереження",
    lastSaved: "Останнє збереження",
    playerName: "Ім'я гравця",
    unlockedEffects: "Розблок��вані ефекти",
    language: "Мова",
  },
}

// Get translation for the current language
export function getTranslation(key: keyof Translations, language: Language): string {
  return translations[language][key]
}
