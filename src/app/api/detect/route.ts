import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("Received request in Next.js API route")

    // Use AbortController to implement timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000) // 55 second timeout (slightly less than frontend)

    try {
      const response = await fetch("https://brewguard.onrender.com/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      console.log("Backend response status:", response.status)

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // If not JSON, get the text and return a proper error
        const text = await response.text()
        console.error("Non-JSON response from backend:", text.substring(0, 500))
        return NextResponse.json(
          {
            error: `Backend returned non-JSON response (${response.status})`,
            details: text.substring(0, 200) + "...",
          },
          { status: response.status || 502 },
        )
      }

      // Forward the JSON response
      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      // Handle AbortController timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error("Request to backend timed out")
        return NextResponse.json(
          { error: "Backend processing timed out. The model may be initializing or the image is too complex." },
          { status: 504 },
        )
      }

      throw error // Re-throw for the outer catch
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
