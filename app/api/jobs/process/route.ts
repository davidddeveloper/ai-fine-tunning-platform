import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import model from "@/app/api/components/tuneModel"

// This route will be called asynchronously and doesn't need to return a response quickly
export async function POST(req: NextRequest) {
  // Immediately return a response to prevent timeouts
  // The actual processing will continue in the background
  const responsePromise = NextResponse.json({ message: "Job processing started" })

  // Process the job in the background
  processJob(req).catch((error) => {
    console.error("Error processing job:", error)
  })

  return responsePromise
}

async function processJob(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { jobId } = await req.json()

    if (!jobId) {
      console.error("No job ID provided")
      return
    }

    // Get the job details
    const { data: job, error: jobError } = await supabase.from("model_jobs").select("*").eq("id", jobId).single()

    if (jobError || !job) {
      console.error("Error fetching job:", jobError)
      return
    }

    // Update job status to processing
    await supabase.from("model_jobs").update({ status: "processing" }).eq("id", jobId)

    // Call the model training function
    const modelInfo = {
      modelName: job.name,
      type: job.type,
      trainingData: job.training_data,
    }

    try {
      // Train the model
      const tunedModel = await model(modelInfo)

      if (!tunedModel) {
        throw new Error("Failed to create model")
      }

      // Create a record in the models table
      const { error: modelError } = await supabase.from("models").insert({
        name: job.name,
        type: job.type,
        base_model: job.base_model,
        status: "ready",
        tuned_model_id: tunedModel,
        user_id: job.user_id,
      })

      if (modelError) {
        throw modelError
      }

      // Update job status to completed
      await supabase
        .from("model_jobs")
        .update({
          status: "completed",
          tuned_model_id: tunedModel,
        })
        .eq("id", jobId)
    } catch (error) {
        const errorAsError = error as Error
      console.error("Error in model training:", error)

      // Update job status to failed
      await supabase
        .from("model_jobs")
        .update({
          status: "failed",
          error_message: errorAsError.message || "Unknown error",
        })
        .eq("id", jobId)
    }
  } catch (error) {
    console.error("Error in job processing:", error)
  }
}
