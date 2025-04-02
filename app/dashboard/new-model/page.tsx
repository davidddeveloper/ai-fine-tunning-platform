"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { readFile } from "fs"

export default function NewModelPage() {
  const [modelName, setModelName] = useState("")
  const [modelType, setModelType] = useState("generate")
  const [baseModel, setBaseModel] = useState("gemini-1.5-flash-001-tuning")
  const [trainingMethod, setTrainingMethod] = useState("upload")
  const [trainingData, setTrainingData] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const parseTrainingData = async () => {
    try {
      if (trainingMethod === "paste") {
        return JSON.parse(trainingData)
      } else if (file) {
        // In a real app, you'd read and parse the file
        // For now, we'll just return an empty array
        const fileText = await file.text()
        return JSON.parse(fileText)

      }
      return []
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please provide valid JSON training data",
      })
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const trainingDataParsed = await parseTrainingData()
      if (!trainingDataParsed) {
        setLoading(false)
        return
      }

      // Call your API to create a new model
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
          type: modelType,
          baseModel: baseModel,
          trainingData: trainingDataParsed,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create model")
      }

      const result = await response.json()

      // Save model info to Supabase
      const { error } = await supabase.from("models").insert({
        name: modelName,
        type: modelType,
        base_model: baseModel,
        status: "training",
        tuned_model_id: result.tuned_model,
        user_id: session.user.id,
      })

      if (error) throw error

      toast({
        title: "Model created",
        description: "Your model is now being trained",
      })

      router.push("/dashboard/models")
    } catch (error: any) {
      console.error("Error creating model:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create model",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Model</h1>
          <p className="text-muted-foreground">Fine-tune an AI model with your custom data</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
              <CardDescription>Provide basic information about your model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  placeholder="e.g., Email Summarizer"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Model Type</Label>
                <RadioGroup value={modelType} onValueChange={setModelType} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="generate" id="generate" />
                    <Label htmlFor="generate">Text Generation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="classify" id="classify" />
                    <Label htmlFor="classify">Classification</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-model">Base Model</Label>
                <Select value={baseModel} onValueChange={setBaseModel}>
                  <SelectTrigger id="base-model">
                    <SelectValue placeholder="Select a base model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-1.5-flash-001-tuning">Gemini 1.5 Flash</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Training Data</CardTitle>
              <CardDescription>Provide the data to fine-tune your model</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={trainingMethod} onValueChange={setTrainingMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload JSON File</Label>
                    <Input id="file" type="file" accept=".json,.jsonl" onChange={handleFileChange} />
                    <p className="text-sm text-muted-foreground">Upload a JSON file with your training data</p>
                  </div>
                </TabsContent>
                <TabsContent value="paste" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="training-data">Training Data (JSON)</Label>
                    <Textarea
                      id="training-data"
                      placeholder={`[
  {
    "text_input": "Your input text here",
    "output": "Expected output here"
  },
  {
    "text_input": "Another input example",
    "output": "Another output example"
  }
]`}
                      value={trainingData}
                      onChange={(e) => setTrainingData(e.target.value)}
                      className="min-h-[200px] font-mono"
                    />
                    <p className="text-sm text-muted-foreground">Paste your training data in JSON format</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Model..." : "Create Model"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}

