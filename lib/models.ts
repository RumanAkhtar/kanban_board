import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface List {
  _id?: ObjectId
  title: string
  order: number
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id?: ObjectId
  title: string
  description?: string
  dueDate?: string
  priority?: "low" | "medium" | "high"
  listId: ObjectId
  userId: ObjectId
  order: number
  createdAt: Date
  updatedAt: Date
}

