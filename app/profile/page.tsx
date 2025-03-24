"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import Image from "next/image"

// Add type interface for list items
interface List {
  _id: string
  title: string
  count?: number
}

interface Task {
  _id: string
  listId: string
}

const ProfilePage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    coverImage: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [lists, setLists] = useState<List[]>([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/")
    } else {
      fetchProfile()
      fetchLists()
      fetchTasks()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        toast.error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Error fetching profile")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists")
      if (response.ok) {
        const data = await response.json()
        setLists(data)
      } else {
        toast.error("Failed to fetch lists")
      }
    } catch (error) {
      console.error("Error fetching lists:", error)
      toast.error("Error fetching lists")
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        toast.error("Failed to fetch tasks")
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Error fetching tasks")
    }
  }

  const handleInputChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setIsEditing(false)
        fetchProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile")
    }
  }

  const handleImageUpload = async (e: any, type: string) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append("image", file)
    formData.append("type", type)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({ ...profile, [type]: data.url })
        toast.success(`${type === "avatar" ? "Avatar" : "Cover image"} updated!`)
      } else {
        toast.error(`Failed to upload ${type}`)
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(`Error uploading ${type}`)
    }
  }

  // Fix for line 85 - Add type to the list parameter
  const completedListId = lists.find((list: List) => list.title === "Done")?._id

  // Fix for line 87 - Add type to the 't' parameter
  const completedTasks = completedListId ? tasks.filter((t: Task) => t.listId === completedListId).length : 0

  // Fix for line 90 - Add type to the list parameter
  const listsWithCounts = lists.map((list: List) => ({
    ...list,
    count: tasks.filter((task: Task) => task.listId === list._id).length,
  }))

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Not authenticated.</div>
  }

  return (
    <div className="container mx-auto mt-8 p-8 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="mb-4 relative">
        <Image
          src={profile.coverImage || "/placeholder-cover.jpg"}
          alt="Cover Image"
          width={800}
          height={200}
          className="w-full h-48 object-cover rounded-md"
        />
        <label
          htmlFor="cover-upload"
          className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700"
        >
          Change Cover
        </label>
        <input
          type="file"
          accept="image/*"
          id="cover-upload"
          className="hidden"
          onChange={(e) => handleImageUpload(e, "cover")}
          aria-label="Upload cover image"
        />
      </div>

      <div className="mb-4 relative w-32 h-32 rounded-full overflow-hidden">
        <Image
          src={profile.avatar || "/placeholder-avatar.jpg"}
          alt="Avatar"
          width={128}
          height={128}
          className="w-full h-full object-cover"
        />
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700"
        >
          Change Avatar
        </label>
        <input
          type="file"
          accept="image/*"
          id="avatar-upload"
          className="hidden"
          onChange={(e) => handleImageUpload(e, "avatar")}
          aria-label="Upload profile picture"
        />
      </div>

      {isEditing ? (
        <div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Profile
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
          >
            Edit Profile
          </button>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Task Summary</h2>
        <p>
          <strong>Total Lists:</strong> {lists.length}
        </p>
        <p>
          <strong>Total Tasks:</strong> {tasks.length}
        </p>
        <p>
          <strong>Completed Tasks:</strong> {completedTasks}
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Lists with Task Counts</h2>
        <ul>
          {listsWithCounts.map((list) => (
            <li key={list._id}>
              {list.title}: {list.count || 0} tasks
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ProfilePage

