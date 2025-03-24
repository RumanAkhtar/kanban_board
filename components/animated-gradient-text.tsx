"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface AnimatedGradientTextProps {
  text: string
  className?: string
}

export default function AnimatedGradientText({ text, className = "" }: AnimatedGradientTextProps) {
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const textElement = textRef.current
    if (!textElement) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!textElement) return

      const rect = textElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      textElement.style.setProperty("--x", `${x}%`)
      textElement.style.setProperty("--y", `${y}%`)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <motion.h1
      ref={textRef}
      className={`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent relative ${className}`}
      style={{
        backgroundSize: "200% 200%",
        backgroundPosition: "var(--x, 0%) var(--y, 0%)",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.h1>
  )
}

