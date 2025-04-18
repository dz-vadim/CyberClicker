"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface MusicPlayerProps {
  enabled: boolean
  onToggle: () => void
  primaryColor: string
  secondaryColor: string
}

// Список доступных треков
const MUSIC_TRACKS = [
  {
    name: "Cyber War",
    url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=cyber-war-126419.mp3",
  },
  {
    name: "Cyberpunk",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_dc39bbc7aa.mp3?filename=cyberpunk-2099-10621.mp3",
  },
  {
    name: "Digital World",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c3b7cc6d87.mp3?filename=digital-world-126277.mp3",
  },
]

export default function MusicPlayer({ enabled, onToggle, primaryColor, secondaryColor }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = document.getElementById("background-music") as HTMLAudioElement

      if (!audioRef.current) {
        audioRef.current = new Audio(MUSIC_TRACKS[currentTrackIndex].url)
        audioRef.current.id = "background-music"
        audioRef.current.loop = true
        audioRef.current.volume = 0.3
        document.body.appendChild(audioRef.current)
      }

      // Add event listener for when track ends
      audioRef.current.addEventListener("ended", () => {
        // Play next track
        const nextTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length
        setCurrentTrackIndex(nextTrackIndex)
        audioRef.current!.src = MUSIC_TRACKS[nextTrackIndex].url
        audioRef.current!.play().catch((error) => {
          console.error("Audio play failed:", error)
        })
      })
    }

    // Play or pause based on enabled state
    if (enabled) {
      // Set the current track
      audioRef.current.src = MUSIC_TRACKS[currentTrackIndex].url

      const playPromise = audioRef.current.play()

      // Handle play promise (required for browsers that return a promise)
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Audio play failed:", error)
            // Auto-play was prevented, we need user interaction
            setIsPlaying(false)
          })
      }
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [enabled, currentTrackIndex])

  // Change track
  const changeTrack = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length
    setCurrentTrackIndex(nextTrackIndex)

    if (audioRef.current && isPlaying) {
      audioRef.current.src = MUSIC_TRACKS[nextTrackIndex].url
      audioRef.current.play().catch((error) => {
        console.error("Audio play failed:", error)
      })
    }
  }

  return (
    <div className="relative group">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-sm border-2 bg-black/50"
        style={{
          borderColor: secondaryColor,
          color: secondaryColor,
          boxShadow: `0 0 10px ${secondaryColor}40`,
        }}
        onClick={onToggle}
        title={isPlaying ? "Mute Music" : "Play Music"}
      >
        {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>

      {isPlaying && (
        <div
          className="absolute top-full right-0 mt-1 bg-black/80 border rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ borderColor: secondaryColor }}
        >
          <button className="text-xs px-2 py-1 whitespace-nowrap" style={{ color: primaryColor }} onClick={changeTrack}>
            {MUSIC_TRACKS[currentTrackIndex].name} ▶
          </button>
        </div>
      )}
    </div>
  )
}
