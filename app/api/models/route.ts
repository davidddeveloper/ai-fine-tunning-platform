import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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

    // Create a job record in the database
    const { data: job, error: jobError } = await supabase
      .from("model_jobs")
      .insert({
        name,
        type,
        base_model: baseModel,
        status: "queued",
        user_id: session.user.id,
        training_data: trainingData,
      })
      .select()
      .single()

    if (jobError) {
      throw jobError
    }

    // Trigger the background job processing
    // This is a non-blocking call that will return immediately
    fetch(`${req.nextUrl.origin}/api/jobs/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId: job.id }),
    }).catch((error) => {
      console.error("Error triggering job processing:", error)
    })

    return NextResponse.json({
      message: "Model training job queued successfully",
      job_id: job.id,
    })
  } catch (error: any) {
    console.error("Error creating model job:", error)
    return NextResponse.json({ error: error.message || "Failed to create model job" }, { status: 500 })
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
