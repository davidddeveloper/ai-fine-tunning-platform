"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { PostgrestSingleResponse, User } from "@supabase/supabase-js"

export default function SettingsPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [apiKeys, setApiKeys] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        setEmail(session.user.email || "")
        setUser(session.user)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()

    
  }, [supabase])

  useEffect(() => {
    try {
      supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user?.id)
        .then((response: PostgrestSingleResponse<any[]>) => {
          if (response.data) {
            setApiKeys(response.data.map((key) => key.key))
          } else {
            setApiKeys([])
          }
        })
    } catch (error: unknown) {
      console.error("Error fetching API keys:", error)
    }
  }, [supabase, user, apiKeys])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match",
      })
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const generateApiKey = async () => {
    if (apiKeys.length >= 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have reached the maximum number of API keys",
      })
      return
    }

    setApiKeyLoading(true)
    try {
      const { data: apiKey, error } = await supabase
      .rpc("generate_api_key") // Create a stored procedure for key generation

      if (error) throw error

      const newApiKeys = [...apiKeys, apiKey]
      setApiKeys(newApiKeys)

      toast({
        title: "API Key Generated",
        description: `Your new API key is ${apiKey}`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate API key",
      })
    } finally {
      setApiKeyLoading(false)
    }
  }

  const handleApiKeyDelete = async (apiKey: string) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .match({ key: apiKey })

      if (error) throw error

      const newApiKeys = apiKeys.filter((key) => key !== apiKey)
      setApiKeys(newApiKeys)

      toast({
        title: "API Key Deleted",
        description: `API key ${apiKey} has been deleted`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete API key",
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

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View and update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} readOnly disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for accessing the platform programmatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your API Keys</Label>
                <div className="flex items-center justify-between space-y-4">
                  <div className="space-y-2">
                    <Label>API Keys</Label>
                    <p className="text-sm text-muted-foreground">
                      {apiKeys.length > 0 ? (
                        <span>{apiKeys.length} API keys found</span>
                      ) : (
                        <span>No API keys found.</span>
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowApiKeys((prev) => !prev)}
                  >
                    {showApiKeys ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showApiKeys && (
                  <ul className="list-disc pl-4">
                    {apiKeys.map((apiKey) => (
                      <li key={apiKey} className="flex items-center justify-between space-y-4">
                        <span className="text-sm">{apiKey || '(hidden)'}</span>
                        <Button
                          onClick={() => handleApiKeyDelete(apiKey)}
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateApiKey} disabled={apiKeyLoading}>
                {apiKeyLoading ? "Generating..." : "Generate New API Key"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}


