"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Bot, Home, LogOut, Plus, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-6 w-6" />
          <span>AI Tuner</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Button variant="outline" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="w-full md:w-[250px] border-r bg-muted/40">
          <nav className="grid gap-2 p-4 text-sm">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/models"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                pathname === "/dashboard/models"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Bot className="h-4 w-4" />
              My Models
            </Link>
            <Link
              href="/dashboard/new-model"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                pathname === "/dashboard/new-model"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Plus className="h-4 w-4" />
              New Model
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                pathname === "/dashboard/settings"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

