import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, getUserId } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// Get all tasks for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const listId = searchParams.get("listId")

    const client = await clientPromise
    const db = client.db()

    const query: any = { userId }
    if (listId) {
      query.listId = new ObjectId(listId)
    }

    const tasks = await db.collection("tasks").find(query).sort({ order: 1 }).toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// Create a new task
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

    const { title, description, dueDate, priority, listId } = await req.json()
    if (!title || !listId) {
      return NextResponse.json({ error: "Title and listId are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Verify that the list exists and belongs to the user
    const list = await db.collection("lists").findOne({ _id: new ObjectId(listId), userId })

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    // Get the highest order value to place the new task at the end of the list
    const lastTask = await db
      .collection("tasks")
      .find({ listId: new ObjectId(listId) })
      .sort({ order: -1 })
      .limit(1)
      .toArray()

    const order = lastTask.length > 0 ? lastTask[0].order + 1 : 0

    const result = await db.collection("tasks").insertOne({
      title,
      description: description || "",
      dueDate: dueDate || null,
      priority: priority || "medium",
      listId: new ObjectId(listId),
      userId,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newTask = await db.collection("tasks").findOne({ _id: result.insertedId })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

