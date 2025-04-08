import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import generateWithTunedModel from "@/app/api/components/generateWithTunedModel"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the model from the database
    const { data: model, error } = await supabase
      .from("models")
      .select("tuned_model_id, user_id")
      .eq("id", params.id)
      .single()

    if (error || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const { input } = await req.json()

    if (!input) {
      return NextResponse.json({ error: "Missing input field" }, { status: 400 })
    }

    // Generate content using the tuned model
    const output = await generateWithTunedModel(model.tuned_model_id, input)

    // Update usage statistics in the database
    const today = new Date().toISOString().split("T")[0]

    // Check if there's an existing usage record for today
    const { data: existingUsage, error: usageQueryError } = await supabase
      .from("usage")
      .select("id, request_count")
      .eq("model_id", params.id)
      .eq("user_id", model.user_id)
      .eq("date", today)
      .single()

    if (usageQueryError && usageQueryError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking usage:", usageQueryError)
    }

    if (existingUsage) {
      // Update existing usage record
      await supabase
        .from("usage")
        .update({
          request_count: existingUsage.request_count + 1,
        })
        .eq("id", existingUsage.id)
    } else {
      // Create new usage record
      await supabase.from("usage").insert({
        model_id: params.id,
        user_id: model.user_id,
        request_count: 1,
        date: today,
      })
    }

    return NextResponse.json({ output })
  } catch (error: any) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}
