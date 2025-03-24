import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, getUserId } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// Get a specific list
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

    const listId = new ObjectId(params.id)

    const client = await clientPromise
    const db = client.db()

    const list = await db.collection("lists").findOne({ _id: listId, userId })

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    return NextResponse.json(list)
  } catch (error) {
    console.error("Error fetching list:", error)
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 })
  }
}

// Update a list
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

    const listId = new ObjectId(params.id)
    const { title, order } = await req.json()

    const client = await clientPromise
    const db = client.db()

    // Check if list exists and belongs to user
    const existingList = await db.collection("lists").findOne({ _id: listId, userId })

    if (!existingList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (order !== undefined) updateData.order = order

    await db.collection("lists").updateOne({ _id: listId }, { $set: updateData })

    const updatedList = await db.collection("lists").findOne({ _id: listId })

    return NextResponse.json(updatedList)
  } catch (error) {
    console.error("Error updating list:", error)
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 })
  }
}

// Delete a list
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

    const listId = new ObjectId(params.id)

    const client = await clientPromise
    const db = client.db()

    // Check if list exists and belongs to user
    const existingList = await db.collection("lists").findOne({ _id: listId, userId })

    if (!existingList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    // Delete all tasks in the list
    await db.collection("tasks").deleteMany({ listId, userId })

    // Delete the list
    await db.collection("lists").deleteOne({ _id: listId, userId })

    return NextResponse.json({ message: "List deleted successfully" })
  } catch (error) {
    console.error("Error deleting list:", error)
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 })
  }
}

