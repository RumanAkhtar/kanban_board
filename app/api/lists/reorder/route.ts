import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, getUserId } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// Reorder lists
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

    const { listId, newOrder } = await req.json()

    if (!listId || newOrder === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if list exists and belongs to user
    const list = await db.collection("lists").findOne({ _id: new ObjectId(listId), userId })

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    // Update the list with new order
    await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) },
      {
        $set: {
          order: newOrder,
          updatedAt: new Date(),
        },
      },
    )

    // Reorder other lists
    const lists = await db.collection("lists").find({ userId }).sort({ order: 1 }).toArray()

    for (let i = 0; i < lists.length; i++) {
      if (lists[i]._id.toString() !== listId) {
        const newListOrder = i >= newOrder ? i + 1 : i
        await db
          .collection("lists")
          .updateOne({ _id: lists[i]._id }, { $set: { order: newListOrder, updatedAt: new Date() } })
      }
    }

    return NextResponse.json({ message: "List reordered successfully" })
  } catch (error) {
    console.error("Error reordering list:", error)
    return NextResponse.json({ error: "Failed to reorder list" }, { status: 500 })
  }
}

