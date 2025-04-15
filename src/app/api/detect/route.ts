// Create a Next.js API route to debug the proxy issue
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Log the request for debugging
    console.log("Received request in Next.js API route")

    // Forward the request to the actual backend
    const response = await fetch("https://brewguard.onrender.com/api/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Log the response status
    console.log("Backend response status:", response.status)

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      // If not JSON, get the text and return a proper error
      const text = await response.text()
      console.error("Non-JSON response from backend:", text.substring(0, 500))
      return NextResponse.json({ error: "Backend returned non-JSON response" }, { status: 502 })
    }

    // Forward the JSON response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
