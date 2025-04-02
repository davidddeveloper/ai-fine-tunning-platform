import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Cpu, Database, Layers, Sparkles } from "lucide-react"
import { ToastProvider } from "@/components/ui/toast";

export default function Home() {
  return (
    <ToastProvider>
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Sparkles className="h-6 w-6" />
          <span className="font-bold">AI Tuner</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {/*<Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Pricing
          </Link>*/}
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Fine-tune AI Models with Your Data
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Create custom AI models trained on your specific data. Get better results for your unique use cases.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-square md:aspect-[4/3] overflow-hidden rounded-xl">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 w-full h-full flex items-center justify-center text-white">
                    <div className="p-8 text-center">
                      <Bot className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Custom AI Models</h3>
                      <p>Train models on your specific data for better results</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Fine-tune AI models in three simple steps
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <Database className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">1. Upload Your Data</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload your training data in a simple format with inputs and expected outputs.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <Cpu className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">2. Train Your Model</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select your base model and start the training process with one click.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <Layers className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">3. Use Your Model</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get an API endpoint to make requests to your fine-tuned model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 AI Tuner. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
    </ToastProvider>
  )
}

