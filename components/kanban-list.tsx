"use client"

import { useState } from "react"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import KanbanCard from "@/components/kanban-card"
import TaskDialog from "@/components/task-dialog"
import EditListDialog from "@/components/edit-list-dialog"
import AnimatedCard from "@/components/animated-card"

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

interface KanbanListProps {
  list: List
  tasks: Task[]
  index: number
  onAddTask: (
    listId: string,
    title: string,
    description: string,
    dueDate: string,
    priority: string
  ) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  onUpdateList: (listId: string, title: string) => void
  onDeleteList: (listId: string) => void
  lists: List[]
}

export default function KanbanList({
  list,
  tasks,
  index,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateList,
  onDeleteList,
  lists,
}: KanbanListProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isEditListOpen, setIsEditListOpen] = useState(false)

  // Optional: gradient styles based on list index
  const listColors = [
    "from-yellow-500 to-orange-500",
    "from-blue-500 to-indigo-500",
    "from-green-500 to-emerald-500",
  ]

  const getListColor = (listId: string) => {
    if (!Array.isArray(lists) || lists.length === 0) {
      return "from-purple-500 to-pink-500"
    }

    const index = lists.findIndex((l) => l._id === listId)
    return listColors[index] || "from-purple-500 to-pink-500"
  }

  // Sort tasks by order
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="flex-shrink-0 w-72 max-w-full">
          <AnimatedCard className="h-full">
            <Card
              className="h-full overflow-hidden border-t-4 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 shadow-md hover:shadow-lg dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
              style={{
                borderTopColor: `var(--${index === 0 ? "yellow" : index === 1 ? "blue" : "green"}-500)`,
              }}
            >
              <CardHeader
                className="p-3 flex flex-row items-center justify-between bg-gradient-to-r bg-opacity-10"
                {...provided.dragHandleProps}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getListColor(list._id)}`}></div>
                  <h3 className="font-medium">{list.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditListOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDeleteList(list._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <Droppable droppableId={list._id} type="task">
                {(provided, snapshot) => (
                  <CardContent
                    className={`p-2 flex flex-col gap-2 h-[calc(100vh-220px)] sm:h-[calc(100vh-220px)] overflow-y-auto transition-colors duration-200 ${
                      snapshot.isDraggingOver ? "bg-muted/50 dark:bg-gray-700/50" : ""
                    }`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <AnimatePresence>
                      {sortedTasks.map((task, index) => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <KanbanCard
                            task={task}
                            index={index}
                            onUpdateTask={onUpdateTask}
                            onDeleteTask={onDeleteTask}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                      onClick={() => setIsTaskDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </CardContent>
                )}
              </Droppable>
            </Card>
          </AnimatedCard>

          <TaskDialog
            open={isTaskDialogOpen}
            onOpenChange={setIsTaskDialogOpen}
            onSave={(title, description, dueDate, priority) => {
              onAddTask(list._id, title, description, dueDate, priority)
            }}
          />

          <EditListDialog
            open={isEditListOpen}
            onOpenChange={setIsEditListOpen}
            listTitle={list.title}
            onSave={(title) => onUpdateList(list._id, title)}
          />
        </div>
      )}
    </Draggable>
  )
}
