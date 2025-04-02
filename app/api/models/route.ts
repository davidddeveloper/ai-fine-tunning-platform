import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import model from "@/app/api/components/tuneModel"

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

    const { name, type, baseModel, trainingData } = await req.json()

    if (!name || !type || !baseModel || !trainingData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a tuned model
    const modelInfo = { modelName: name, type, trainingData }
    const tunedModel = await model(modelInfo)

    if (!tunedModel) {
      return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
    }

    return NextResponse.json({ tuned_model: tunedModel })
  } catch (error: any) {
    console.error("Error creating model:", error)
    return NextResponse.json({ error: error.message || "Failed to create model" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's models from the database
    const { data: models, error } = await supabase
      .from("models")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
    }

    return NextResponse.json({ models })
  } catch (error: any) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch models" }, { status: 500 })
  }
}

