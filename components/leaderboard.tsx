"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Edit2, Check } from "lucide-react"
import { formatNumber } from "@/utils/format-number"

interface LeaderboardProps {
  playerName: string
  playerScore: number
  playerPrestige: number
  onNameChange: (name: string) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

type LeaderboardEntry = {
  name: string
  score: number
  prestige: number
}

export default function Leaderboard({
  playerName,
  playerScore,
  playerPrestige,
  onNameChange,
  primaryColor,
  secondaryColor,
  accentColor,
}: LeaderboardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])

  // Load leaderboard data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("leaderboard")
      if (savedData) {
        const parsedData = JSON.parse(savedData) as LeaderboardEntry[]
        setLeaderboardData(parsedData)
      }
    } catch (error) {
      console.error("Error loading leaderboard data:", error)
    }
  }, [])

  // Update player entry in leaderboard
  useEffect(() => {
    if (!playerName) return

    const updatedLeaderboard = [...leaderboardData]
    const playerIndex = updatedLeaderboard.findIndex((entry) => entry.name === playerName)

    if (playerIndex >= 0) {
      // Update existing entry
      updatedLeaderboard[playerIndex] = {
        ...updatedLeaderboard[playerIndex],
        score: playerScore,
        prestige: playerPrestige,
      }
    } else {
      // Add new entry
      updatedLeaderboard.push({
        name: playerName,
        score: playerScore,
        prestige: playerPrestige,
      })
    }

    // Sort by prestige only (primary)
    updatedLeaderboard.sort((a, b) => b.prestige - a.prestige)

    // Limit to top 10
    const topEntries = updatedLeaderboard.slice(0, 10)
    setLeaderboardData(topEntries)

    // Save to localStorage
    localStorage.setItem("leaderboard", JSON.stringify(topEntries))
  }, [playerName, playerScore, playerPrestige])

  const handleNameSubmit = () => {
    if (nameInput.trim() && nameInput !== playerName) {
      onNameChange(nameInput.trim())
    }
    setIsEditingName(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Trophy className="w-5 h-5 mr-2" style={{ color: accentColor }} />
          <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
            Leaderboard
          </h3>
        </div>

        {/* Player name edit */}
        <div className="flex items-center">
          {isEditingName ? (
            <div className="flex items-center">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-black/30 border rounded-sm px-2 py-1 text-sm mr-2"
                style={{ borderColor: secondaryColor, color: primaryColor }}
                maxLength={15}
              />
              <button
                className="p-1 rounded-sm border"
                style={{ borderColor: accentColor, color: accentColor }}
                onClick={handleNameSubmit}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-sm mr-2" style={{ color: secondaryColor }}>
                {playerName}
              </span>
              <button
                className="p-1 rounded-sm border"
                style={{ borderColor: secondaryColor, color: secondaryColor }}
                onClick={() => setIsEditingName(true)}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="border rounded-sm overflow-hidden" style={{ borderColor: `${secondaryColor}80` }}>
        {/* Header */}
        <div
          className="grid grid-cols-12 gap-2 p-2 border-b text-xs font-bold"
          style={{ borderColor: `${secondaryColor}40`, color: secondaryColor }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-5">Name</div>
          <div className="col-span-3 text-right">Prestige</div>
          <div className="col-span-3 text-right">Score</div>
        </div>

        {/* Entries */}
        <div className="max-h-48 overflow-y-auto">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((entry, index) => (
              <motion.div
                key={`${entry.name}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-12 gap-2 p-2 text-xs border-b ${
                  entry.name === playerName ? "bg-white/5" : ""
                }`}
                style={{ borderColor: `${secondaryColor}20` }}
              >
                <div className="col-span-1 font-bold" style={{ color: index < 3 ? accentColor : secondaryColor }}>
                  {index + 1}
                </div>
                <div
                  className="col-span-5 font-medium truncate"
                  style={{
                    color: entry.name === playerName ? primaryColor : secondaryColor,
                  }}
                >
                  {entry.name}
                </div>
                <div
                  className="col-span-3 text-right"
                  style={{ color: entry.name === playerName ? accentColor : secondaryColor }}
                >
                  {formatNumber(entry.prestige)}
                </div>
                <div
                  className="col-span-3 text-right"
                  style={{ color: entry.name === playerName ? primaryColor : secondaryColor }}
                >
                  ¥{formatNumber(entry.score)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-4 text-center text-sm" style={{ color: `${secondaryColor}80` }}>
              No entries yet. Be the first!
            </div>
          )}
        </div>
      </div>

      {/* Player stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded-sm p-2" style={{ borderColor: `${secondaryColor}40` }}>
          <div className="text-xs" style={{ color: `${secondaryColor}80` }}>
            Your Prestige
          </div>
          <div className="text-lg font-bold" style={{ color: accentColor }}>
            {formatNumber(playerPrestige)}
          </div>
        </div>
        <div className="border rounded-sm p-2" style={{ borderColor: `${secondaryColor}40` }}>
          <div className="text-xs" style={{ color: `${secondaryColor}80` }}>
            Your Score
          </div>
          <div className="text-lg font-bold" style={{ color: primaryColor }}>
            ¥{formatNumber(playerScore)}
          </div>
        </div>
      </div>
    </div>
  )
}
