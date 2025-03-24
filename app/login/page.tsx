"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { setTheme, resolvedTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Invalid email or password")
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login successful",
          description: "Welcome to your Kanban board",
          variant: "default",
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred during login")
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setEmail("demo@example.com")
    setPassword("demopassword")
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: "demo@example.com",
        password: "demopassword",
      })

      if (result?.error) {
        setError("Demo login failed")
        toast({
          title: "Demo login failed",
          description: "Could not log in with demo account",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Demo mode activated",
          description: "Welcome to the Kanban board demo",
          variant: "default",
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred during login")
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <span className="sr-only">Toggle theme</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M4.93 4.93l1.41 1.41"></path>
            <path d="M17.66 17.66l1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="M6.34 17.66l-1.41 1.41"></path>
            <path d="M19.07 4.93l-1.41 1.41"></path>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.2 }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-xl">K</span>
                  </motion.div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Welcome to Kanban</CardTitle>
                <CardDescription className="text-center">Sign in to access your boards and tasks</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md">
                      {error}
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="w-full"
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="w-full"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                    >
                      Try Demo
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="text-center text-sm"
                  >
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                      Register
                    </Link>
                  </motion.div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>

        <div className="hidden md:flex md:flex-1 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 dark:from-blue-500/10 dark:to-purple-600/10"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Organize Your Work
              <br />
              Boost Your Productivity
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-lg mb-8 max-w-md text-gray-700 dark:text-gray-300"
            >
              Manage projects, organize tasks, and build team collaboration—all in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex space-x-4"
            >
              <Button
                variant="outline"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 border-white/30 dark:border-gray-700/30"
                onClick={() => router.push("/register")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

