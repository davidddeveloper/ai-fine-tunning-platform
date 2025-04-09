"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Bot, Copy, ExternalLink, MoreHorizontal, RefreshCw, Trash } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface Model {
  id: string
  name: string
  type: string
  status: string
  created_at: string
  tuned_model_id: string
}

interface ModelJob {
  id: string
  name: string
  type: string
  status: string
  created_at: string
  error_message?: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [jobs, setJobs] = useState<ModelJob[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const fetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return
      }

      // Fetch models from Supabase
      const { data: modelsData, error: modelsError } = await supabase
        .from("models")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (modelsError) throw modelsError

      // Fetch jobs from Supabase
      const { data: jobsData, error: jobsError } = await supabase
        .from("model_jobs")
        .select("*")
        .eq("user_id", session.user.id)
        .in("status", ["queued", "processing", "failed"])
        .order("created_at", { ascending: false })

      if (jobsError) throw jobsError

      setModels(modelsData || [])
      setJobs(jobsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load models and jobs",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up a real-time subscription for model_jobs table
    const jobsSubscription = supabase
      .channel("model_jobs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "model_jobs",
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    // Set up a real-time subscription for models table
    const modelsSubscription = supabase
      .channel("models_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "models",
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(jobsSubscription)
      supabase.removeChannel(modelsSubscription)
    }
  }, [supabase, toast])

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
  }

  const copyApiUrl = (modelId: string) => {
    const apiUrl = `${window.location.origin}/api/generate/${modelId}`
    navigator.clipboard.writeText(apiUrl)
    toast({
      title: "API URL copied",
      description: "The API URL has been copied to your clipboard",
    })
  }

  const deleteModel = async (id: string) => {
    try {
      const { error } = await supabase.from("models").delete().eq("id", id)

      if (error) throw error

      setModels(models.filter((model) => model.id !== id))
      toast({
        title: "Model deleted",
        description: "The model has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting model:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete model",
      })
    }
  }

  const cancelJob = async (id: string) => {
    try {
      const { error } = await supabase.from("model_jobs").update({ status: "cancelled" }).eq("id", id)

      if (error) throw error

      setJobs(jobs.filter((job) => job.id !== id))
      toast({
        title: "Job cancelled",
        description: "The training job has been cancelled",
      })
    } catch (error) {
      console.error("Error cancelling job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel job",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Models</h1>
            <p className="text-muted-foreground">Manage your fine-tuned AI models</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/dashboard/new-model">
              <Button>New Model</Button>
            </Link>
          </div>
        </div>

        {jobs.length > 0 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Training Jobs</h2>
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{job.name}</CardTitle>
                    <CardDescription>
                      {job.type === "classify" ? "Classification Model" : "Text Generation Model"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => cancelJob(job.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Cancel Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center">
                        <span
                          className={`flex h-2 w-2 rounded-full mr-2 ${
                            job.status === "processing"
                              ? "bg-yellow-500"
                              : job.status === "queued"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        ></span>
                        <span className="capitalize">{job.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    {job.status === "failed" && job.error_message && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
                        Error: {job.error_message}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Completed Models</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : models.length === 0 && jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No models found</h3>
                <p className="text-muted-foreground mb-4">You haven't created any fine-tuned models yet</p>
                <Link href="/dashboard/new-model">
                  <Button>Create your first model</Button>
                </Link>
              </CardContent>
            </Card>
          ) : models.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground">
                  No completed models yet. Your models will appear here once training is complete.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>{model.name}</CardTitle>
                      <CardDescription>
                        {model.type === "classify" ? "Classification Model" : "Text Generation Model"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyApiUrl(model.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy API URL
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/models/${model.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteModel(model.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Model
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center">
                          <span
                            className={`flex h-2 w-2 rounded-full mr-2 ${
                              model.status === "ready"
                                ? "bg-green-500"
                                : model.status === "training"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></span>
                          <span className="capitalize">{model.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(model.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Model ID:</span>
                        <span className="font-mono text-xs">{model.tuned_model_id.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
