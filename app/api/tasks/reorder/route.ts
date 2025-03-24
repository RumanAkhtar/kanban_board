import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, getUserId } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// Reorder tasks (for drag and drop functionality)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const { taskId, sourceListId, destinationListId, newOrder } = await req.json()

    if (!taskId || !sourceListId || !destinationListId || newOrder === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if task exists and belongs to user
    const task = await db.collection("tasks").findOne({ _id: new ObjectId(taskId), userId })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if source and destination lists exist and belong to user
    const sourceList = await db.collection("lists").findOne({ _id: new ObjectId(sourceListId), userId })

    const destinationList = await db.collection("lists").findOne({ _id: new ObjectId(destinationListId), userId })

    if (!sourceList || !destinationList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    // Update the task with new list ID and order
    await db.collection("tasks").updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          listId: new ObjectId(destinationListId),
          order: newOrder,
          updatedAt: new Date(),
        },
      },
    )

    // If the task moved to a different list, reorder tasks in both lists
    if (sourceListId !== destinationListId) {
      // Reorder tasks in the source list
      const sourceTasks = await db
        .collection("tasks")
        .find({ listId: new ObjectId(sourceListId), userId })
        .sort({ order: 1 })
        .toArray()

      for (let i = 0; i < sourceTasks.length; i++) {
        await db
          .collection("tasks")
          .updateOne({ _id: sourceTasks[i]._id }, { $set: { order: i, updatedAt: new Date() } })
      }
    }

    // Reorder tasks in the destination list
    const destinationTasks = await db
      .collection("tasks")
      .find({ listId: new ObjectId(destinationListId), userId })
      .sort({ order: 1 })
      .toArray()

    for (let i = 0; i < destinationTasks.length; i++) {
      if (i !== newOrder) {
        // Skip the task we just updated
        await db
          .collection("tasks")
          .updateOne(
            { _id: destinationTasks[i]._id },
            { $set: { order: i >= newOrder ? i + 1 : i, updatedAt: new Date() } },
          )
      }
    }

    return NextResponse.json({ message: "Task reordered successfully" })
  } catch (error) {
    console.error("Error reordering task:", error)
    return NextResponse.json({ error: "Failed to reorder task" }, { status: 500 })
  }
}

