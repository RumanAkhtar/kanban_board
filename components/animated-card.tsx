"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
}

export default function AnimatedCard({ children, className = "" }: AnimatedCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [scale, setScale] = useState(1)
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 })

  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()

    // Calculate mouse position relative to card center
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    // Calculate rotation based on mouse position
    // Limit rotation to a small amount for subtle effect
    const rotateXAmount = (mouseY / (rect.height / 2)) * -5
    const rotateYAmount = (mouseX / (rect.width / 2)) * 5

    setRotateX(rotateXAmount)
    setRotateY(rotateYAmount)

    // Update glow position
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlowPosition({ x, y })
  }

  const handleMouseEnter = () => {
    setScale(1.02)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setScale(1)
    setGlowPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: "transform 0.1s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

