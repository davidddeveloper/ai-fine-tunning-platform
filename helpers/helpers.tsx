import { SupabaseClient, createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const totalModels = async (): Promise<number> => {
    const supabase = createClientComponentClient()
    
  try {

    const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.error("No session found")
        return 0
      }
    
    const { data, error } = await supabase
        .from("models")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

    if (error) throw error

    return data.length
  } catch (error) {
    console.error("Error fetching models:", error)
    return 0
  }
}

export { totalModels }