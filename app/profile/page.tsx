"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Camera,
  Save,
  Calendar,
  Activity,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import AnimatedCard from "@/components/animated-card"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalTasks: 0,
    lists: [],
  })
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      setIsLoading(true)

      const tasksResponse = await fetch("/api/tasks")
      if (!tasksResponse.ok) throw new Error("Failed to fetch tasks")
      const tasks = await tasksResponse.json()

      const listsResponse = await fetch("/api/lists")
      if (!listsResponse.ok) throw new Error("Failed to fetch lists")
      const lists = await listsResponse.json()

      const completedListId = lists.find((list) => list.title === "Done")?._id
      const completedTasks = completedListId
        ? tasks.filter((task) => task.listId === completedListId).length
        : 0
      const totalTasks = tasks.length

      const listsWithCounts = lists.map((list) => ({
        ...list,
        count: tasks.filter((task) => task.listId === list._id).length,
      }))

      setStats({
        completedTasks,
        totalTasks,
        lists: listsWithCounts,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      })
    }, 1000)
  }

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-full md:w-1/3"
            >
              <AnimatedCard>
                <Card className="overflow-hidden dark:bg-gray-800/80">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <div className="flex justify-center -mt-16">
                    <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 relative">
                      <AvatarImage
                        src={
                          session?.user?.image ||
                          "https://plus.unsplash.com/premium_photo-1682023585957-f191203ab239?q=80&w=3184&auto=format&fit=crop&ixlib=rb-4.0.3"
                        }
                        alt="Profile"
                      />
                      <AvatarFallback className="text-4xl">
                        {name.charAt(0)}
                      </AvatarFallback>
                      <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </Avatar>
                  </div>
                  <CardHeader className="text-center pt-2">
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>{email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Activity</p>
                        <p className="text-sm text-muted-foreground">
                          Last active today
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Completion Rate</p>
                        <p className="text-sm text-muted-foreground">
                          {completionRate}% tasks completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>

            {/* Profile Form & Stats Tabs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full md:w-2/3"
            >
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4">
                  <AnimatedCard>
                    <Card className="dark:bg-gray-800/80">
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your profile information here
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="name">Name</Label>
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                      </CardContent>
                      {isEditing && (
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                Save Changes
                                <Save className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </AnimatedCard>
                </TabsContent>

                <TabsContent value="stats" className="mt-4">
                  <AnimatedCard>
                    <Card className="dark:bg-gray-800/80">
                      <CardHeader>
                        <CardTitle>Task Statistics</CardTitle>
                        <CardDescription>
                          Your task completion statistics
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Completion Rate
                            </span>
                            <span className="text-sm font-medium">
                              {completionRate}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Completed Tasks
                            </h4>
                            <p className="text-2xl font-bold">
                              {stats.completedTasks}
                            </p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              Total Tasks
                            </h4>
                            <p className="text-2xl font-bold">
                              {stats.totalTasks}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Task Distribution
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {stats.lists.map((list, index) => {
                              const percentage =
                                stats.totalTasks > 0
                                  ? Math.round(
                                      (list.count / stats.totalTasks) * 100
                                    )
                                  : 0
                              const getColor = (i: number) => {
                                switch (i % 3) {
                                  case 0:
                                    return "bg-yellow-500"
                                  case 1:
                                    return "bg-blue-500"
                                  case 2:
                                    return "bg-green-500"
                                  default:
                                    return "bg-purple-500"
                                }
                              }

                              return (
                                <div key={list._id} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>{list.title}</span>
                                    <span>{percentage}%</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${getColor(
                                        index
                                      )}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
