import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import monitorTuningJob from "@/app/api/components/monitorTuningJob"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the model from the database
    const { data: model, error } = await supabase.from("models").select("*").eq("id", params.id).single()

    if (error || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Check if the model belongs to the user
    if (model.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you would check the actual status of the tuning job
    // For now, we'll simulate checking the status
    let status = model.status

    if (status === "training") {
      // Simulate checking the status with the monitoring function
      // In a real app, you would use the operation ID stored in the database
      try {
        // This is a placeholder - in a real app you'd use the actual operation ID
        const operationId = model.tuned_model_id
        const result = await monitorTuningJob(operationId)

        if (result) {
          status = "ready"

          // Update the model status in the database
          await supabase.from("models").update({ status: "ready" }).eq("id", params.id)
        }
      } catch (error) {
        console.error("Error monitoring tuning job:", error)
      }
    }

    return NextResponse.json({ status })
  } catch (error: any) {
    console.error("Error checking model status:", error)
    return NextResponse.json({ error: error.message || "Failed to check model status" }, { status: 500 })
  }
}

