"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateList: (title: string) => void
}

export default function CreateListDialog({ open, onOpenChange, onCreateList }: CreateListDialogProps) {
  const [title, setTitle] = useState("")

  const handleCreate = () => {
    if (title.trim()) {
      onCreateList(title)
      setTitle("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="list-title">List Title</Label>
            <Input
              id="list-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter list title"
              autoFocus
              className="border-input focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

