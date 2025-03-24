import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import CursorEffect from "@/components/cursor-effect"
import AnimatedBackground from "@/components/animated-background"
import SessionWrapper from "../components/SessionWrapper" // ✅ New wrapper

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "A modern Kanban board application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <SessionWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AnimatedBackground />
            <CursorEffect />
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}
