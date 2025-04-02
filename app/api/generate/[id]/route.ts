import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import generateWithTunedModel from "@/app/api/components/generateWithTunedModel"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    // Validate API key
    const { data: user, error: userError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("key", apiKey)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 })
    }

    const { id } = await context.params;

    // Get the model from the database
    const { data: model, error } = await supabase.from("models").select("*").eq("id", id.trim()).single()

    if (error || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const { input } = await req.json()

    if (!input) {
      return NextResponse.json({ error: "Missing input field" }, { status: 400 })
    }

    // Generate content using the tuned model
    const output = await generateWithTunedModel(model.tuned_model_id, input)

    // Update usage statistics
    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .upsert({
        model_id: id,
        request_count: { increment: 1},
        user_id: user.user_id,
        date: new Date().toISOString().split("T")[0],
      })
      .select("request_count")
      .single()

    if (usageError || !usage) {
      return NextResponse.json({ error: "Failed to update usage statistics" }, { status: 500 })
    }

    if (usage.request_count > 50) {
      return NextResponse.json({ error: "Monthly request limit exceeded" }, { status: 402 })
    }

    return NextResponse.json({ output })
  } catch (error: any) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}

