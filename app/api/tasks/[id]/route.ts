import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, getUserId } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// Get a specific task
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const taskId = new ObjectId(params.id)

    const client = await clientPromise
    const db = client.db()

    const task = await db.collection("tasks").findOne({ _id: taskId, userId })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

// Update a task
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const taskId = new ObjectId(params.id)
    const { title, description, dueDate, priority, listId, order } = await req.json()

    const client = await clientPromise
    const db = client.db()

    // Check if task exists and belongs to user
    const existingTask = await db.collection("tasks").findOne({ _id: taskId, userId })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = dueDate
    if (priority !== undefined) updateData.priority = priority
    if (order !== undefined) updateData.order = order

    if (listId !== undefined) {
      // Verify that the new list exists and belongs to the user
      const list = await db.collection("lists").findOne({ _id: new ObjectId(listId), userId })

      if (!list) {
        return NextResponse.json({ error: "List not found" }, { status: 404 })
      }

      updateData.listId = new ObjectId(listId)
    }

    await db.collection("tasks").updateOne({ _id: taskId }, { $set: updateData })

    const updatedTask = await db.collection("tasks").findOne({ _id: taskId })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// Delete a task
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const taskId = new ObjectId(params.id)

    const client = await clientPromise
    const db = client.db()

    // Check if task exists and belongs to user
    const existingTask = await db.collection("tasks").findOne({ _id: taskId, userId })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await db.collection("tasks").deleteOne({ _id: taskId, userId })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}

