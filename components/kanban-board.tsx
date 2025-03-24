"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import KanbanList from "@/components/kanban-list"
import CreateListDialog from "@/components/create-list-dialog"
import confetti from "canvas-confetti"
import { useToast } from "@/components/ui/use-toast"
import AnimatedGradientText from "@/components/animated-gradient-text"

interface List {
  _id: string
  title: string
  order: number
}

interface Task {
  _id: string
  title: string
  description?: string
  dueDate?: string
  priority?: string
  listId: string
  order: number
}

export default function KanbanBoard() {
  const [lists, setLists] = useState<List[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch lists and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch lists
        const listsResponse = await fetch("/api/lists")
        if (!listsResponse.ok) {
          throw new Error("Failed to fetch lists")
        }
        const listsData = await listsResponse.json()

        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks")
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks")
        }
        const tasksData = await tasksResponse.json()

        setLists(listsData)
        setTasks(tasksData)
      } catch (error: any) {
        setError(error.message)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result

    // If there's no destination or the item was dropped back in the same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // If dragging lists
    if (type === "list") {
      const newLists = Array.from(lists)
      const movedList = newLists.find((list) => list._id === draggableId)

      if (movedList) {
        newLists.splice(source.index, 1)
        newLists.splice(destination.index, 0, movedList)

        // Update order property for each list
        const updatedLists = newLists.map((list, index) => ({
          ...list,
          order: index,
        }))

        setLists(updatedLists)

        try {
          // Update list order in the database
          await fetch("/api/lists/reorder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              listId: draggableId,
              newOrder: destination.index,
            }),
          })

          toast({
            title: "List reordered",
            description: `"${movedList.title}" has been moved`,
            variant: "default",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to reorder list",
            variant: "destructive",
          })
        }
      }
      return
    }

    // If dragging tasks
    const taskId = draggableId
    const task = tasks.find((t) => t._id === taskId)

    if (!task) return

    const newTasks = tasks.map((t) => {
      if (t._id === taskId) {
        return {
          ...t,
          listId: destination.droppableId,
        }
      }
      return t
    })

    // Trigger confetti if task is moved to "Done" list
    const destinationList = lists.find((list) => list._id === destination.droppableId)
    const sourceList = lists.find((list) => list._id === source.droppableId)

    if (destinationList?.title === "Done" && sourceList?.title !== "Done") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      toast({
        title: "Task completed! 🎉",
        description: `"${task.title}" has been marked as done`,
        variant: "success",
      })
    } else if (destinationList) {
      toast({
        title: "Task moved",
        description: `"${task.title}" moved to "${destinationList.title}"`,
        variant: "default",
      })
    }

    // Update tasks state
    setTasks(newTasks)

    try {
      // Update task in the database
      await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          sourceListId: source.droppableId,
          destinationListId: destination.droppableId,
          newOrder: destination.index,
        }),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const addList = async (title: string) => {
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to create list")
      }

      const newList = await response.json()
      setLists([...lists, newList])

      toast({
        title: "List created",
        description: `"${title}" list has been created`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create list",
        variant: "destructive",
      })
    }
  }

  const addTask = async (listId: string, title: string, description: string, dueDate: string, priority: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority,
          listId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const newTask = await response.json()
      setTasks([...tasks, newTask])

      toast({
        title: "Task created",
        description: `"${title}" has been added`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)))

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find((task) => task._id === taskId)
      if (!taskToDelete) return

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setTasks(tasks.filter((task) => task._id !== taskId))

      toast({
        title: "Task deleted",
        description: `"${taskToDelete.title}" has been removed`,
        variant: "destructive",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const updateList = async (listId: string, title: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to update list")
      }

      const updatedList = await response.json()
      setLists(lists.map((list) => (list._id === listId ? updatedList : list)))

      toast({
        title: "List updated",
        description: `List renamed to "${title}"`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update list",
        variant: "destructive",
      })
    }
  }

  const deleteList = async (listId: string) => {
    try {
      const listToDelete = lists.find((list) => list._id === listId)
      if (!listToDelete) return

      const tasksInList = tasks.filter((task) => task.listId === listId).length

      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete list")
      }

      setLists(lists.filter((list) => list._id !== listId))
      setTasks(tasks.filter((task) => task.listId !== listId))

      toast({
        title: "List deleted",
        description: `"${listToDelete.title}" and ${tasksInList} tasks have been removed`,
        variant: "destructive",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete list",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="mb-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </header>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 h-[calc(100vh-220px)] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Board</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6"
      >
        <AnimatedGradientText text="My Kanban Board" className="text-2xl sm:text-3xl font-bold mb-1" />
        <p className="text-muted-foreground text-sm sm:text-base">Organize your tasks with drag and drop</p>
      </motion.header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <AnimatePresence>
                {lists.map((list, index) => (
                  <motion.div
                    key={list._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, height: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="snap-start"
                  >
                    <KanbanList
                      list={list}
                      tasks={tasks.filter((task) => task.listId === list._id)}
                      index={index}
                      onAddTask={addTask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onUpdateList={updateList}
                      onDeleteList={deleteList}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {provided.placeholder}

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: lists.length * 0.1, duration: 0.3 }}
                className="flex-shrink-0 w-72 snap-start"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
                  onClick={() => setIsCreateListOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add List
                </Button>
              </motion.div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <CreateListDialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen} onCreateList={addList} />
    </motion.div>
  )
}

