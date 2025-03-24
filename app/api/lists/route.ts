import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, getUserId } from "@/lib/auth"
import clientPromise from "@/lib/db"

// Get all lists for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const lists = await db.collection("lists").find({ userId }).sort({ order: 1 }).toArray()

    return NextResponse.json(lists)
  } catch (error) {
    console.error("Error fetching lists:", error)
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 })
  }
}

// Create a new list
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

    const { title } = await req.json()
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the highest order value to place the new list at the end
    const lastList = await db.collection("lists").find({ userId }).sort({ order: -1 }).limit(1).toArray()

    const order = lastList.length > 0 ? lastList[0].order + 1 : 0

    const result = await db.collection("lists").insertOne({
      title,
      order,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newList = await db.collection("lists").findOne({ _id: result.insertedId })

    return NextResponse.json(newList, { status: 201 })
  } catch (error) {
    console.error("Error creating list:", error)
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 })
  }
}

