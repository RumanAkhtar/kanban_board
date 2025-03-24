import { NextResponse } from "next/server"
import { hash } from "bcryptjs" // ✅ Use bcryptjs instead of bcrypt
import clientPromise from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // ✅ Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // ✅ Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // ✅ Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // ✅ Hash password securely
    const hashedPassword = await hash(password, 10)

    // ✅ Create new user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
