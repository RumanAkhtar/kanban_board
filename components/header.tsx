"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { signOut, useSession } from "next-auth/react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toast } = useToast()
  const { data: session } = useSession()

  const defaultAvatar =
    "https://plus.unsplash.com/premium_photo-1682023585957-f191203ab239?q=80&w=3184&auto=format&fit=crop&ixlib=rb-4.0.3"

  const userAvatar = session?.user?.image || defaultAvatar

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    }
  }

  const handleNotificationClick = () => {
    setHasNotifications(false)
    toast({
      title: "Notifications cleared",
      description: "You have no new notifications",
    })
  }

  if (!mounted) return null

  const currentTheme = theme === "system" ? resolvedTheme : theme

  const renderNavLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary relative ${
        pathname === href ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {label}
      {pathname === href && (
        <motion.div
          layoutId="nav-underline"
          className="absolute left-0 right-0 h-0.5 bg-primary bottom-[-6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold relative z-10">K</span>
              <motion.div
                className="absolute inset-0 bg-white opacity-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.3 }}
              />
            </motion.div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
              Kanban
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {renderNavLink("/dashboard", "Dashboard")}
            {renderNavLink("/profile", "Profile")}

            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={handleNotificationClick}
                    >
                      <Bell className="h-5 w-5" />
                      {hasNotifications && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                      aria-label="Toggle theme"
                      className="relative overflow-hidden"
                    >
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-full"
                        initial={{ scale: 0 }}
                        whileTap={{ scale: 1, opacity: 0.5, transition: { duration: 0.15 } }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full overflow-hidden"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={session?.user?.name || "User"} />
                      <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1, opacity: 0.5, transition: { duration: 0.2 } }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session?.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark") }>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">K</span>
                  </div>
                  <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    Kanban
                  </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <nav className="flex flex-col space-y-4">
                  {renderNavLink("/dashboard", "Dashboard")}
                  {renderNavLink("/profile", "Profile")}

                  <Button
                    variant="ghost"
                    className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted w-full"
                    onClick={() => {
                      handleNotificationClick()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                    {hasNotifications && <span className="w-2 h-2 bg-red-500 rounded-full ml-auto" />}
                  </Button>
                </nav>
              </div>

              <div className="p-4 border-t dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={session?.user?.name || "User"} />
                    <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}