import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import generateWithTunedModel from "@/app/api/components/generateWithTunedModel"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { modelId, input } = await req.json()

    if (!modelId || !input) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate content using the tuned model
    const output = await generateWithTunedModel(modelId, input)

    return NextResponse.json({ output })
  } catch (error: any) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}

