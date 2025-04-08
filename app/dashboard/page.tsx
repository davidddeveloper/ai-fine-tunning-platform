"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Clock, Database, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Model {
  id: string
  name: string
  type: string
  status: string
  created_at: string
}

interface Usage {
  model_id: string
  model_name: string
  request_count: number
  limit: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalModels, setTotalModels] = useState(0)
  const [trainingJobs, setTrainingJobs] = useState(0)
  const [apiCalls, setApiCalls] = useState(0)
  const [trainingDatasets, setTrainingDatasets] = useState(0)
  const [recentModels, setRecentModels] = useState<Model[]>([])
  const [modelUsage, setModelUsage] = useState<Usage[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        const userId = session.user.id

        // Fetch total models count
        const { count: modelsCount, error: modelsError } = await supabase
          .from("models")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        if (modelsError) throw modelsError
        setTotalModels(modelsCount || 0)

        // Fetch training jobs count
        const { count: trainingCount, error: trainingError } = await supabase
          .from("models")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "training")

        if (trainingError) throw trainingError
        setTrainingJobs(trainingCount || 0)

        // Fetch API calls count (sum of request_count from usage table for current month)
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()

        const { data: usageData, error: usageError } = await supabase
          .from("usage")
          .select("request_count")
          .eq("user_id", userId)
          .gte("date", firstDayOfMonth)
          .lte("date", lastDayOfMonth)

        if (usageError) throw usageError

        const totalApiCalls = usageData?.reduce((sum, item) => sum + item.request_count, 0) || 0
        setApiCalls(totalApiCalls)

        // For training datasets, we'll use the count of models as a proxy
        // In a real app, you might have a separate table for datasets
        setTrainingDatasets(modelsCount || 0)

        // Fetch recent models
        const { data: recentModelsData, error: recentModelsError } = await supabase
          .from("models")
          .select("id, name, type, status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentModelsError) throw recentModelsError
        setRecentModels(recentModelsData || [])

        // Fetch model usage data
        // In a real app, you would aggregate this data from the usage table
        // For this example, we'll create some sample data based on the models
        if (recentModelsData && recentModelsData.length > 0) {
          const { data: modelUsageData, error: modelUsageError } = await supabase
            .from("usage")
            .select(`
              model_id,
              models!inner(name),
              request_count
            `)
            .eq("user_id", userId)
            .gte("date", firstDayOfMonth)
            .lte("date", lastDayOfMonth)
            .order("request_count", { ascending: false })
            .limit(5)

          if (modelUsageError) throw modelUsageError

          // Transform the data to include model names and calculate percentages
          const usageWithNames =
            modelUsageData?.map((item) => ({
              model_id: item.model_id,
              model_name: item.models && item.models[0] ? item.models[0].name : null,
              request_count: item.request_count,
              limit: 250, // Assuming a fixed limit of 250 calls per model
            })) || []

          setModelUsage(usageWithNames)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your AI model fine-tuning dashboard</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalModels}</div>
                  <p className="text-xs text-muted-foreground">Fine-tuned models in your account</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingJobs}</div>
                  <p className="text-xs text-muted-foreground">Active training jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiCalls}</div>
                  <p className="text-xs text-muted-foreground">API calls this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Data</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingDatasets}</div>
                  <p className="text-xs text-muted-foreground">Training datasets</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Models</CardTitle>
                  <CardDescription>Your recently created fine-tuned models</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentModels.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No models found. Create your first model to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-sm font-medium">
                        <div>Name</div>
                        <div>Status</div>
                        <div>Created</div>
                      </div>
                      {recentModels.map((model) => (
                        <div key={model.id} className="grid grid-cols-3 items-center gap-4 text-sm">
                          <div className="font-medium">{model.name}</div>
                          <div>
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
                          <div className="text-gray-500">{formatDate(model.created_at)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>API Usage</CardTitle>
                  <CardDescription>Your API usage for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  {modelUsage.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No API usage data available yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {modelUsage.map((usage) => {
                        const percentage = Math.min(Math.round((usage.request_count / usage.limit) * 100), 100)
                        return (
                          <div key={usage.model_id} className="space-y-2">
                            <div className="text-sm font-medium">{usage.model_name}</div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {usage.request_count} / {usage.limit} calls ({percentage}%)
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
