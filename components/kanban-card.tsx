"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TaskDialog from "@/components/task-dialog"
import { motion } from "framer-motion"

interface Task {
  _id: string
  title: string
  description?: string
  dueDate?: string
  priority?: string
  listId: string
  order: number
}

interface KanbanCardProps {
  task: Task
  index: number
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
}

export default function KanbanCard({ task, index, onUpdateTask, onDeleteTask }: KanbanCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/40"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Calculate if the task is due soon (within 2 days)
  const isDueSoon = () => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 2
  }

  // Calculate if the task is overdue
  const isOverdue = () => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    return dueDate < today
  }

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-card dark:bg-gray-800 hover:bg-accent/50 dark:hover:bg-gray-700/80 transition-all duration-200 ${
              snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20 dark:ring-primary/30" : "shadow-sm"
            }`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{task.title}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDeleteTask(task._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
              )}
            </CardContent>

            <CardFooter className="p-3 pt-0 flex flex-wrap gap-2">
              {task.dueDate && (
                <Badge
                  variant="outline"
                  className={`text-xs flex items-center gap-1 ${
                    isOverdue()
                      ? "border-red-500 text-red-500 dark:border-red-400 dark:text-red-400"
                      : isDueSoon()
                        ? "border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400"
                        : ""
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                  {isOverdue() && " (Overdue)"}
                  {isDueSoon() && !isOverdue() && " (Soon)"}
                </Badge>
              )}

              {task.priority && <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>}
            </CardFooter>

            <TaskDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              task={task}
              onSave={(title, description, dueDate, priority) => {
                onUpdateTask(task._id, { title, description, dueDate, priority })
              }}
            />
          </Card>
        </motion.div>
      )}
    </Draggable>
  )
}

