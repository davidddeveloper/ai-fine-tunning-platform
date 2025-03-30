import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import generateWithTunedModel from "@/app/api/components/generateWithTunedModel"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the model from the database
    const { data: model, error } = await supabase.from("models").select("tuned_model_id").eq("id", params.id).single()

    if (error || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const { input } = await req.json()

    if (!input) {
      return NextResponse.json({ error: "Missing input field" }, { status: 400 })
    }

    // Generate content using the tuned model
    const output = await generateWithTunedModel(model.tuned_model_id, input)

    // Update usage statistics (in a real app)
    // await supabase.from('usage').insert({ model_id: params.id, timestamp: new Date() })

    return NextResponse.json({ output })
  } catch (error: any) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}

