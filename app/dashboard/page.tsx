import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Clock, Database, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your AI model fine-tuning dashboard</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Fine-tuned models in your account</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Active training jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">API calls this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Data</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
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
              <div className="space-y-4">
                <div className="grid grid-cols-3 text-sm font-medium">
                  <div>Name</div>
                  <div>Status</div>
                  <div>Created</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 text-sm">
                  <div className="font-medium">Email Summarizer</div>
                  <div>
                    <div className="flex items-center">
                      <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Ready
                    </div>
                  </div>
                  <div className="text-gray-500">2 days ago</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 text-sm">
                  <div className="font-medium">Text Classifier</div>
                  <div>
                    <div className="flex items-center">
                      <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                      Training
                    </div>
                  </div>
                  <div className="text-gray-500">5 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>Your API usage for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Email Summarizer</div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 w-[75%] rounded-full bg-primary"></div>
                  </div>
                  <div className="text-xs text-gray-500">187 / 250 calls (75%)</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Text Classifier</div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 w-[25%] rounded-full bg-primary"></div>
                  </div>
                  <div className="text-xs text-gray-500">58 / 250 calls (25%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

