"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ClickEffectProps {
  x: number
  y: number
  colors: string[]
  effects?: string[]
}

export default function ClickEffect({ x, y, colors, effects = [] }: ClickEffectProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      angle: number
      speed: number
    }>
  >([])

  useEffect(() => {
    // Create particles
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: 0,
      y: 0,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 4 + 2,
    }))

    setParticles(newParticles)
  }, [colors])

  // Determine which effects to show
  const showPixelDust = effects.includes("basic-1")
  const showEchoClick = effects.includes("basic-2")
  const showPlasmaBurst = effects.includes("premium-1")
  const showHologramClick = effects.includes("premium-4")
  const showQuantumParticles = effects.includes("elite-1")
  const showFractalClick = effects.includes("elite-4")
  const showSupernova = effects.includes("legendary-1")
  const showDimensionalRift = effects.includes("legendary-4")

  return (
    <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
      {/* Default particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${showPixelDust ? "rounded-none" : "rounded-sm"}`}
          style={{
            left: x,
            top: y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 10px ${particle.color}`,
          }}
          initial={{ scale: 0 }}
          animate={{
            x: Math.cos(particle.angle) * particle.speed * 20,
            y: Math.sin(particle.angle) * particle.speed * 20,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Digital ring effect */}
      <motion.div
        className="absolute rounded-sm border-2"
        style={{
          left: x - 20,
          top: y - 20,
          width: 40,
          height: 40,
          borderColor: colors[0],
          boxShadow: `0 0 15px ${colors[0]}`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Digital glitch effect */}
      <motion.div
        className="absolute rounded-sm"
        style={{
          left: x - 5,
          top: y - 5,
          width: 10,
          height: 10,
          backgroundColor: colors[0],
          boxShadow: `0 0 15px ${colors[0]}`,
        }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: [1, 1.5, 0.8, 1.2, 0], opacity: [1, 0.8, 0.9, 0.7, 0] }}
        transition={{ duration: 0.3 }}
      />

      {/* Echo Click effect */}
      {showEchoClick && (
        <>
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              left: x - 30,
              top: y - 30,
              width: 60,
              height: 60,
              borderColor: colors[1],
              opacity: 0.7,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              left: x - 30,
              top: y - 30,
              width: 60,
              height: 60,
              borderColor: colors[2],
              opacity: 0.5,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />
        </>
      )}

      {/* Plasma Burst effect */}
      {showPlasmaBurst && (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: x - 40,
            top: y - 40,
            width: 80,
            height: 80,
            background: `radial-gradient(circle, ${colors[0]} 0%, ${colors[1]} 50%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Hologram Click effect */}
      {showHologramClick && (
        <>
          <motion.div
            className="absolute"
            style={{
              left: x - 20,
              top: y - 20,
              width: 40,
              height: 40,
              background: `linear-gradient(135deg, ${colors[0]}80 0%, ${colors[1]}00 100%)`,
              border: `1px solid ${colors[0]}`,
              boxShadow: `0 0 10px ${colors[0]}`,
            }}
            initial={{ opacity: 0.8, scale: 1, rotateY: 0 }}
            animate={{ opacity: 0, scale: 1.5, rotateY: 90 }}
            transition={{ duration: 0.7 }}
          />
          <motion.div
            className="absolute"
            style={{
              left: x - 15,
              top: y - 15,
              width: 30,
              height: 30,
              border: `1px solid ${colors[1]}`,
              boxShadow: `0 0 5px ${colors[1]}`,
            }}
            initial={{ opacity: 0.8, scale: 1, rotateX: 0 }}
            animate={{ opacity: 0, scale: 1.5, rotateX: 90 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          />
        </>
      )}

      {/* Quantum Particles effect */}
      {showQuantumParticles && (
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = ((Math.PI * 2) / 8) * i
            return (
              <motion.div
                key={`quantum-${i}`}
                className="absolute rounded-full"
                style={{
                  left: x - 3,
                  top: y - 3,
                  width: 6,
                  height: 6,
                  backgroundColor: colors[i % colors.length],
                  boxShadow: `0 0 8px ${colors[i % colors.length]}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: [0, Math.cos(angle) * 30, Math.cos(angle + Math.PI) * 60, Math.cos(angle) * 90],
                  y: [0, Math.sin(angle) * 30, Math.sin(angle + Math.PI) * 60, Math.sin(angle) * 90],
                  opacity: [1, 0.8, 0.4, 0],
                }}
                transition={{ duration: 1, ease: "linear" }}
              />
            )
          })}
        </>
      )}

      {/* Fractal Click effect */}
      {showFractalClick && (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const size = 10 + i * 15
            return (
              <motion.div
                key={`fractal-${i}`}
                className="absolute"
                style={{
                  left: x - size / 2,
                  top: y - size / 2,
                  width: size,
                  height: size,
                  borderColor: colors[i % colors.length],
                  border: `1px solid ${colors[i % colors.length]}`,
                  transform: `rotate(${i * 15}deg)`,
                }}
                initial={{ opacity: 0.8, scale: 0 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            )
          })}
        </>
      )}

      {/* Supernova effect */}
      {showSupernova && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              left: x - 50,
              top: y - 50,
              width: 100,
              height: 100,
              background: `radial-gradient(circle, white 0%, ${colors[0]} 30%, ${colors[1]} 60%, transparent 80%)`,
            }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = ((Math.PI * 2) / 12) * i
            return (
              <motion.div
                key={`nova-${i}`}
                className="absolute rounded-full"
                style={{
                  left: x - 2,
                  top: y - 2,
                  width: 4,
                  height: 4,
                  backgroundColor: "white",
                  boxShadow: `0 0 10px white, 0 0 20px ${colors[i % colors.length]}`,
                }}
                initial={{ scale: 0 }}
                animate={{
                  x: Math.cos(angle) * 100,
                  y: Math.sin(angle) * 100,
                  scale: [0, 1, 0],
                }}
                transition={{ duration: 1 }}
              />
            )
          })}
        </>
      )}

      {/* Dimensional Rift effect */}
      {showDimensionalRift && (
        <>
          <motion.div
            className="absolute"
            style={{
              left: x - 40,
              top: y - 2,
              width: 80,
              height: 4,
              background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 50%, transparent 100%)`,
              boxShadow: `0 0 20px ${colors[0]}`,
            }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute"
            style={{
              left: x - 2,
              top: y - 40,
              width: 4,
              height: 80,
              background: `linear-gradient(0deg, transparent 0%, ${colors[1]} 50%, transparent 100%)`,
              boxShadow: `0 0 20px ${colors[1]}`,
            }}
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{ scaleY: 1, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              left: x - 20,
              top: y - 20,
              width: 40,
              height: 40,
              border: `2px solid ${colors[2]}`,
              boxShadow: `inset 0 0 20px ${colors[2]}`,
            }}
            initial={{ scale: 0, opacity: 0.7, rotate: 0 }}
            animate={{ scale: 2, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.7 }}
          />
        </>
      )}
    </div>
  )
}
