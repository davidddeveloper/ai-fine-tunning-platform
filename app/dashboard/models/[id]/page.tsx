"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Bot, Check, Copy, RefreshCw } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Model {
  id: string
  name: string
  type: string
  status: string
  progress: number
  created_at: string
  tuned_model_id: string
  base_model: string
}

export default function ModelDetailPage() {
  const params = useParams()
  const modelId = params.id as string
  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [testInput, setTestInput] = useState("")
  const [testOutput, setTestOutput] = useState("")
  const [testLoading, setTestLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const { data, error } = await supabase.from("models").select("*").eq("id", modelId).single()

        if (error) throw error

        setModel(data)
        setApiUrl(`${window.location.origin}/api/generate/${data.id}`)
      } catch (error) {
        console.error("Error fetching model:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load model details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchModel()
  }, [modelId, supabase, toast])

  // Poll for status updates if the model is training
  useEffect(() => {
    if (!model || model.status !== "training") return

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/models/${modelId}/status`)
        if (!response.ok) throw new Error("Failed to fetch status")

        const data = await response.json()

        if (data.status !== model.status || data.progress !== model.progress) {
          setModel((prev) => (prev ? { ...prev, status: data.status, progress: data.progress } : null))

          if (data.status === "ready") {
            toast({
              title: "Training complete",
              description: "Your model is now ready to use",
            })
            clearInterval(intervalId)
          } else if (data.status === "failed") {
            toast({
              variant: "destructive",
              title: "Training failed",
              description: "There was an error training your model",
            })
            clearInterval(intervalId)
          }
        }
      } catch (error) {
        console.error("Error polling status:", error)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(intervalId)
  }, [model, modelId, toast])

  const copyApiUrl = () => {
    navigator.clipboard.writeText(apiUrl)
    setCopied(true)
    toast({
      title: "API URL copied",
      description: "The API URL has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const testModel = async () => {
    if (!testInput.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text to test",
      })
      return
    }

    setTestLoading(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: model?.tuned_model_id,
          input: testInput,
          trackUsage: true, // Track this usage
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate output")
      }

      const data = await response.json()
      setTestOutput(data.output)
    } catch (error) {
      console.error("Error testing model:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to test model",
      })
    } finally {
      setTestLoading(false)
    }
  }

  const refreshStatus = async () => {
    if (!model) return

    try {
      const response = await fetch(`/api/models/${model.id}/status`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to refresh status")
      }

      const data = await response.json()

      // Update model status and progress
      setModel({ ...model, status: data.status, progress: data.progress })

      toast({
        title: "Status updated",
        description: `Model status: ${data.status}`,
      })
    } catch (error) {
      console.error("Error refreshing status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh status",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!model) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-bold">Model not found</h2>
          <p className="text-muted-foreground">
            The model you're looking for doesn't exist or you don't have access to it
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{model.name}</h1>
            <p className="text-muted-foreground">
              {model.type === "classify" ? "Classification Model" : "Text Generation Model"}
            </p>
          </div>
          <Button variant="outline" onClick={refreshStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Model Details</CardTitle>
              <CardDescription>Information about your fine-tuned model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center mt-1">
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
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(model.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {model.status === "training" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Training Progress</p>
                    <p className="text-sm text-muted-foreground">{Math.round(model.progress)}%</p>
                  </div>
                  <Progress value={model.progress} className="h-2" />
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Base Model</p>
                <p className="text-sm text-muted-foreground mt-1">{model.base_model}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Model ID</p>
                <p className="text-sm font-mono text-muted-foreground mt-1 break-all">{model.tuned_model_id}</p>
              </div>

              <div>
                <p className="text-sm font-medium">API Endpoint</p>
                <div className="flex mt-1">
                  <Input value={apiUrl} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" className="ml-2" onClick={copyApiUrl}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Your Model</CardTitle>
              <CardDescription>Try out your fine-tuned model with sample inputs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Input Text</Label>
                <Textarea
                  id="test-input"
                  placeholder="Enter text to test your model..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={testModel} disabled={testLoading || model.status !== "ready"} className="w-full">
                {testLoading ? "Generating..." : "Generate Output"}
              </Button>

              {testOutput && (
                <div className="space-y-2">
                  <Label htmlFor="test-output">Model Output</Label>
                  <div className="p-4 rounded-md bg-muted min-h-[100px] whitespace-pre-wrap">{testOutput}</div>
                </div>
              )}

              {model.status !== "ready" && (
                <div className="flex items-center justify-center p-4 rounded-md bg-muted">
                  <Bot className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {model.status === "training"
                      ? `Model is training (${Math.round(model.progress)}% complete). Testing will be available when ready.`
                      : `Model is ${model.status}. Testing will be available when ready.`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>How to use your fine-tuned model via API</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="space-y-2">
                <div className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto">
                  {`curl -X POST ${apiUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Your input text here"}'`}
                </div>
              </TabsContent>
              <TabsContent value="javascript" className="space-y-2">
                <div className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto">
                  {`// Using fetch
const response = await fetch("${apiUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    input: "Your input text here"
  }),
});

const data = await response.json();
console.log(data.output);`}
                </div>
              </TabsContent>
              <TabsContent value="python" className="space-y-2">
                <div className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto">
                  {`import requests

response = requests.post(
    "${apiUrl}",
    json={"input": "Your input text here"}
)

data = response.json()
print(data["output"])`}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
