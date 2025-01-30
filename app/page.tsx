"use client";

import Quiz from "@/components/Quiz"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const clearProgress = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quizState")
      window.location.reload()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-r from-background to-muted relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <h1 className="text-3xl font-bold mb-2 text-center">SOFT SKILLS</h1>
      <div className="flex items-center gap-2 mb-8">
        <p className="text-sm text-muted-foreground">made by shivzee</p>
        <a
          href="https://github.com/shivam1608"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="w-4 h-4" />
          GitHub
        </a>
      </div>
      <Quiz />
      <Button onClick={clearProgress} variant="outline" className="mt-4">
        Clear Progress & Start Over
      </Button>
    </main>
  )
}

