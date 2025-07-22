import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "https://sleft-signal.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log(`Making request to backend: ${BACKEND_URL}/api/generate`)

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("Backend response error:", response.status, errorData)
      return NextResponse.json({ error: errorData.error || "Failed to generate brief" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating brief:", error)
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 })
  }
}
