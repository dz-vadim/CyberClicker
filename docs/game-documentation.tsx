"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Language } from "@/utils/language"

interface GameDocumentationProps {
  language: Language
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

// Translations for documentation
const docTranslations = {
  en: {
    title: "Cyber Clicker Documentation",
    overview: "Game Overview",
    overviewText:
      "Cyber Clicker is a cyberpunk-themed incremental game where you earn credits by clicking and purchasing upgrades to automate and increase your income. The game features multiple upgrade paths, visual customization, and prestige mechanics.",
    mechanics: "Game Mechanics",
    clicking: "Clicking",
    clickingText:
      "The core mechanic is clicking the main area to earn credits. Each click gives you a base amount of credits that can be increased through upgrades.",
    upgrades: "Upgrades",
    upgradesText: "There are three categories of upgrades:",
    basicUpgrades: "Basic Upgrades",
    basicUpgradesText:
      "- Double Value: Doubles your credits per click\n- Auto Hack: Automatically clicks once per second\n- Critical Hack: Chance to get 5x credits on click\n- Passive Income: Earn credits over time without clicking",
    advancedUpgrades: "Advanced Upgrades",
    advancedUpgradesText:
      "Unlocked by purchasing all basic upgrades:\n- Click Multiplier: Multiply your click value\n- Auto Speed: Increase auto hack speed\n- Click Combo: Consecutive clicks increase value\n- Offline Earnings: Earn credits while away",
    specialUpgrades: "Special Upgrades",
    specialUpgradesText:
      "Unlocked by purchasing all advanced upgrades:\n- Lucky Clicks: Random chance for bonus credits\n- Mega Click: Special ability for massive click value",
    prestige: "Prestige System",
    prestigeText:
      "When you've earned enough credits, you can prestige to reset your progress but earn Robocoins. Each Robocoin gives +10% to all income. The amount of Robocoins you get depends on your total earnings.",
    customization: "Customization",
    skins: "Skins",
    skinsText:
      "The game features 15 different skins that change the color scheme of the game. Each skin has a unique look and must be purchased with credits. Some skins require previous skins to be unlocked first.",
    cases: "Cases System",
    casesText: "Cases can be purchased to unlock special effects and bonuses:",
    basicCase: "Basic Case (¥5,000)",
    basicCaseText: "Common rewards with a small chance for something special",
    premiumCase: "Premium Case (¥25,000)",
    premiumCaseText: "Better rewards with higher chances for rare items",
    eliteCase: "Elite Case (¥100,000)",
    eliteCaseText: "High-quality rewards with guaranteed rare or better items",
    legendaryCase: "Legendary Case (¥500,000)",
    legendaryCaseText: "The best rewards with a chance for legendary items",
    effects: "Effects",
    clickEffects: "Click Effects",
    clickEffectsText: "Visual effects that appear when clicking, such as Pixel Dust, Echo Click, Plasma Burst, etc.",
    visualEffects: "Visual Effects",
    visualEffectsText: "Background effects that enhance the game's appearance, like Neon Glow, Digital Rain, etc.",
    bonusEffects: "Bonus Effects",
    bonusEffectsText: "Gameplay bonuses that improve your earnings, such as Lucky Charm, Credit Boost, etc.",
    specialEffects: "Special Effects",
    specialEffectsText: "Unique effects that significantly change gameplay, like Time Warp, Temporal Shift, etc.",
    fortune: "Fortune Wheel",
    fortuneText:
      "Spin the wheel for a chance to win various rewards:\n- Money: Instant credit rewards\n- Multipliers: Temporary income multipliers\n- Boosts: Temporary boosts to auto clickers\n- Special: Unique rewards like critical click bonuses",
    antiEffects: "Anti-Effects System",
    antiEffectsText:
      "Occasionally, problems will appear in your system that reduce your efficiency. You'll need to spend credits to fix these issues. Anti-effects can reduce click income, block critical clicks, slow down auto clickers, and more.",
    interfaces: "Game Interfaces",
    interfacesText: "The game offers two interface layouts:",
    mobileInterface: "Mobile Interface",
    mobileInterfaceText: "Default interface optimized for smaller screens and vertical layouts",
    desktopInterface: "Desktop Interface",
    desktopInterfaceText: "Unlocked by owning all skins, provides a more spacious layout optimized for larger screens",
    secretFeatures: "Secret Features",
    adminPanel: "Admin Panel",
    adminPanelText:
      "A hidden admin panel can be accessed by pressing Ctrl+Shift+A. This panel allows administrators to modify all game parameters, including money, upgrades, skins, and effects. The default password is 'admin123'.",
    tips: "Tips and Strategies",
    tipsText:
      "- Focus on Auto Hack and Passive Income early to generate income while away\n- Save up for Premium and Elite cases to get powerful effects\n- Prestige when your progress slows down to benefit from Robocoins\n- Unlock all skins to access the Desktop Interface\n- Use the Fortune Wheel regularly for free bonuses",
  },
  uk: {
    title: "Документація Cyber Clicker",
    overview: "Огляд гри",
    overviewText:
      "Cyber Clicker - це інкрементальна гра в стилі кіберпанк, де ви заробляєте кредити, клікаючи та купуючи покращення для автоматизації та збільшення вашого доходу. Гра має кілька шляхів покращення, візуальну кастомізацію та механіки престижу.",
    mechanics: "Ігрові механіки",
    clicking: "Клікання",
    clickingText:
      "Основна механіка - клікання по головній області для заробітку кредитів. Кожен клік дає вам базову кількість кредитів, яку можна збільшити через покращення.",
    upgrades: "Покращення",
    upgradesText: "Існує три категорії покращень:",
    basicUpgrades: "Базові покращення",
    basicUpgradesText:
      "- Подвійна вартість: Подвоює ваші кредити за клік\n- Авто-хак: Автоматично клікає раз на секунду\n- Критичний хак: Шанс отримати в 5 разів більше кредитів за клік\n- Пасивний дохід: Заробляйте кредити з часом без кліків",
    advancedUpgrades: "Просунуті покращення",
    advancedUpgradesText:
      "Розблоковуються при купівлі всіх базових покращень:\n- Множник кліків: Множить вартість вашого кліку\n- Швидкість авто: Збільшує швидкість авто-хаку\n- Комбо кліків: Послідовні кліки збільшують вартість\n- Офлайн-заробіток: Заробляйте кредити, коли ви відсутні",
    specialUpgrades: "Спеціальні покращення",
    specialUpgradesText:
      "Розблоковуються при купівлі всіх просунутих покращень:\n- Щасливі кліки: Випадковий шанс на бонусні кредити\n- Мега-клік: Спеціальна здатність для величезної вартості кліку",
    prestige: "Система престижу",
    prestigeText:
      "Коли ви заробили достатньо кредитів, ви можете виконати престиж, щоб скинути свій прогрес, але отримати Робокоїни. Кожен Робокоїн дає +10% до всього доходу. Кількість Робокоїнів, яку ви отримуєте, залежить від ваших загальних заробітків.",
    customization: "Кастомізація",
    skins: "Скіни",
    skinsText:
      "Гра має 15 різних скінів, які змінюють кольорову схему гри. Кожен скін має унікальний вигляд і повинен бути придбаний за кредити. Деякі скіни вимагають, щоб попередні скіни були розблоковані спочатку.",
    cases: "Система кейсів",
    casesText: "Кейси можна придбати, щоб розблокувати спеціальні ефекти та бонуси:",
    basicCase: "Базовий кейс (¥5,000)",
    basicCaseText: "Звичайні нагороди з невеликим шансом на щось особливе",
    premiumCase: "Преміум кейс (¥25,000)",
    premiumCaseText: "Кращі нагороди з вищими шансами на рідкісні предмети",
    eliteCase: "Елітний кейс (¥100,000)",
    eliteCaseText: "Високоякісні нагороди з гарантованими рідкісними або кращими предметами",
    legendaryCase: "Легендарний кейс (¥500,000)",
    legendaryCaseText: "Найкращі нагороди з шансом на легендарні предмети",
    effects: "Ефекти",
    clickEffects: "Ефекти кліку",
    clickEffectsText:
      "Візуальні ефекти, які з'являються при кліканні, такі як Піксельний пил, Ехо-клік, Плазмовий вибух тощо.",
    visualEffects: "Візуальні ефекти",
    visualEffectsText: "Фонові ефекти, які покращують вигляд гри, як-от Неонове сяйво, Цифровий дощ тощо.",
    bonusEffects: "Бонусні ефекти",
    bonusEffectsText: "Ігрові бонуси, які покращують ваші заробітки, такі як Щасливий талісман, Кредитний буст тощо.",
    specialEffects: "Спеціальні ефекти",
    specialEffectsText: "Унікальні ефекти, які значно змінюють геймплей, як-от Викривлення часу, Часовий зсув тощо.",
    fortune: "Колесо фортуни",
    fortuneText:
      "Крутіть колесо, щоб отримати шанс виграти різні нагороди:\n- Гроші: Миттєві кредитні нагороди\n- Множники: Тимчасові множники доходу\n- Бусти: Тимчасові прискорення для авто-кліків\n- Спеціальні: Унікальні нагороди, як-от бонуси критичних кліків",
    antiEffects: "Система анти-ефектів",
    antiEffectsText:
      "Час від часу у вашій системі з'являтимуться проблеми, які зменшують вашу ефективність. Вам потрібно буде витратити кредити, щоб виправити ці проблеми. Анти-ефекти можуть зменшити дохід від кліків, блокувати критичні кліки, сповільнювати авто-клікери тощо.",
    interfaces: "Ігрові інтерфейси",
    interfacesText: "Гра пропонує два макети інтерфейсу:",
    mobileInterface: "Мобільний інтерфейс",
    mobileInterfaceText: "Стандартний інтерфейс, оптимізований для менших екранів і вертикальних макетів",
    desktopInterface: "Десктопний інтерфейс",
    desktopInterfaceText:
      "Розблоковується при володінні всіма скінами, забезпечує більш просторий макет, оптимізований для більших екранів",
    secretFeatures: "Секретні функції",
    adminPanel: "Адмін-панель",
    adminPanelText:
      "Прихована адмін-панель доступна при натисканні Ctrl+Shift+A. Ця панель дозволяє адміністраторам змінювати всі параметри гри, включаючи гроші, покращення, скіни та ефекти. Пароль за замовчуванням - 'admin123'.",
    tips: "Поради та стратегії",
    tipsText:
      "- Зосередьтеся на Авто-хаку та Пасивному доході на початку, щоб генерувати дохід, коли ви відсутні\n- Накопичуйте на Преміум та Елітні кейси, щоб отримати потужні ефекти\n- Виконуйте престиж, коли ваш прогрес сповільнюється, щоб отримати користь від Робокоїнів\n- Розблокуйте всі скіни, щоб отримати доступ до Десктопного інтерфейсу\n- Регулярно використовуйте Колесо фортуни для безкоштовних бонусів",
  },
}

export default function GameDocumentation({
  language,
  primaryColor,
  secondaryColor,
  accentColor,
}: GameDocumentationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    mechanics: false,
    prestige: false,
    customization: false,
    cases: false,
    effects: false,
    fortune: false,
    antiEffects: false,
    interfaces: false,
    secretFeatures: false,
    tips: false,
  })

  const t = docTranslations[language]

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="mb-4 border-b pb-2" style={{ borderColor: `${secondaryColor}40` }}>
      <div className="flex cursor-pointer items-center justify-between py-2" onClick={() => toggleSection(id)}>
        <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
          {title}
        </h3>
        {expandedSections[id] ? (
          <ChevronUp size={20} style={{ color: secondaryColor }} />
        ) : (
          <ChevronDown size={20} style={{ color: secondaryColor }} />
        )}
      </div>
      {expandedSections[id] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="pl-2 pt-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  )

  const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-3">
      <h4 className="mb-1 font-bold" style={{ color: accentColor }}>
        {title}
      </h4>
      <div className="pl-2" style={{ color: secondaryColor }}>
        {children}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: primaryColor }}>
        {t.title}
      </h2>

      <Section id="overview" title={t.overview}>
        <p className="mb-4" style={{ color: secondaryColor }}>
          {t.overviewText}
        </p>
      </Section>

      <Section id="mechanics" title={t.mechanics}>
        <SubSection title={t.clicking}>
          <p>{t.clickingText}</p>
        </SubSection>

        <SubSection title={t.upgrades}>
          <p>{t.upgradesText}</p>

          <div className="mt-2 space-y-2">
            <div>
              <h5 className="font-bold" style={{ color: secondaryColor }}>
                {t.basicUpgrades}
              </h5>
              <p className="whitespace-pre-line">{t.basicUpgradesText}</p>
            </div>

            <div>
              <h5 className="font-bold" style={{ color: secondaryColor }}>
                {t.advancedUpgrades}
              </h5>
              <p className="whitespace-pre-line">{t.advancedUpgradesText}</p>
            </div>

            <div>
              <h5 className="font-bold" style={{ color: secondaryColor }}>
                {t.specialUpgrades}
              </h5>
              <p className="whitespace-pre-line">{t.specialUpgradesText}</p>
            </div>
          </div>
        </SubSection>
      </Section>

      <Section id="prestige" title={t.prestige}>
        <p style={{ color: secondaryColor }}>{t.prestigeText}</p>
      </Section>

      <Section id="customization" title={t.customization}>
        <SubSection title={t.skins}>
          <p>{t.skinsText}</p>
        </SubSection>
      </Section>

      <Section id="cases" title={t.cases}>
        <p className="mb-2" style={{ color: secondaryColor }}>
          {t.casesText}
        </p>

        <div className="space-y-2 pl-2">
          <div>
            <h5 className="font-bold" style={{ color: "#05d9e8" }}>
              {t.basicCase}
            </h5>
            <p>{t.basicCaseText}</p>
          </div>

          <div>
            <h5 className="font-bold" style={{ color: "#ff2a6d" }}>
              {t.premiumCase}
            </h5>
            <p>{t.premiumCaseText}</p>
          </div>

          <div>
            <h5 className="font-bold" style={{ color: "#d300c5" }}>
              {t.eliteCase}
            </h5>
            <p>{t.eliteCaseText}</p>
          </div>

          <div>
            <h5 className="font-bold" style={{ color: "#39ff14" }}>
              {t.legendaryCase}
            </h5>
            <p>{t.legendaryCaseText}</p>
          </div>
        </div>
      </Section>

      <Section id="effects" title={t.effects}>
        <div className="space-y-3">
          <SubSection title={t.clickEffects}>
            <p>{t.clickEffectsText}</p>
          </SubSection>

          <SubSection title={t.visualEffects}>
            <p>{t.visualEffectsText}</p>
          </SubSection>

          <SubSection title={t.bonusEffects}>
            <p>{t.bonusEffectsText}</p>
          </SubSection>

          <SubSection title={t.specialEffects}>
            <p>{t.specialEffectsText}</p>
          </SubSection>
        </div>
      </Section>

      <Section id="fortune" title={t.fortune}>
        <p className="whitespace-pre-line" style={{ color: secondaryColor }}>
          {t.fortuneText}
        </p>
      </Section>

      <Section id="antiEffects" title={t.antiEffects}>
        <p style={{ color: secondaryColor }}>{t.antiEffectsText}</p>
      </Section>

      <Section id="interfaces" title={t.interfaces}>
        <p className="mb-2" style={{ color: secondaryColor }}>
          {t.interfacesText}
        </p>

        <div className="space-y-2 pl-2">
          <div>
            <h5 className="font-bold" style={{ color: secondaryColor }}>
              {t.mobileInterface}
            </h5>
            <p>{t.mobileInterfaceText}</p>
          </div>

          <div>
            <h5 className="font-bold" style={{ color: secondaryColor }}>
              {t.desktopInterface}
            </h5>
            <p>{t.desktopInterfaceText}</p>
          </div>
        </div>
      </Section>

      <Section id="secretFeatures" title={t.secretFeatures}>
        <SubSection title={t.adminPanel}>
          <p>{t.adminPanelText}</p>
        </SubSection>
      </Section>

      <Section id="tips" title={t.tips}>
        <p className="whitespace-pre-line" style={{ color: secondaryColor }}>
          {t.tipsText}
        </p>
      </Section>
    </div>
  )
}
