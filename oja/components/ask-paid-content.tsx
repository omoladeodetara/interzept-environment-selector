"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Mic, Headphones, Sparkles, Plane, Pencil, Workflow, Check, Loader2, Trash2, X } from "lucide-react"
import { Button } from '@lastprice/ui'
import { cn } from "@/lib/utils"

interface Signal {
  id: string
  title: string
  category: "Activity" | "Outcome"
  hve: number
}

interface GeneratedArtifact {
  agentName: string
  agentDescription: string
  signals: Signal[]
}

interface Message {
  role: "user" | "assistant"
  content: string
  artifact?: GeneratedArtifact
  isLoading?: boolean
}

const templates = [
  { icon: Headphones, label: "Customer Support Agent" },
  { icon: Sparkles, label: "AI SDR" },
  { icon: Plane, label: "Virtual Travel Assistant" },
  { icon: Pencil, label: "Content Creation Assistant" },
  { icon: Workflow, label: "Business Process Automation Agent" },
]

const mockArtifact: GeneratedArtifact = {
  agentName: "Customer Support AI Agent",
  agentDescription:
    "An AI agent designed to manage customer inquiries, offer detailed product information, and resolve common customer issues efficiently.",
  signals: [
    { id: "1", title: "Issue escalation logged", category: "Activity", hve: 7.0 },
    { id: "2", title: "Support ticket created", category: "Activity", hve: 3.0 },
    { id: "3", title: "Live chat initiated", category: "Activity", hve: 8.0 },
    { id: "4", title: "Follow-up email sent", category: "Activity", hve: 4.0 },
    { id: "5", title: "Customer satisfaction assessed", category: "Activity", hve: 10.0 },
    { id: "6", title: "Product information provided", category: "Activity", hve: 15.0 },
    { id: "7", title: "Customer inquiry received", category: "Activity", hve: 6.0 },
    { id: "8", title: "Common issue resolved", category: "Outcome", hve: 12.0 },
    { id: "9", title: "Customer feedback collected", category: "Activity", hve: 5.0 },
    { id: "10", title: "Service level agreement met", category: "Outcome", hve: 20.0 },
  ],
}

export function AskPaidContent() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [artifact, setArtifact] = useState<GeneratedArtifact | null>(null)
  const [showActivateModal, setShowActivateModal] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: "", isLoading: true },
    ])
    setInput("")

    setTimeout(() => {
      setMessages((prev) => {
        const newMessages = [...prev]
        // Replace loading message with actual artifact
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: "",
          artifact: mockArtifact,
          isLoading: false,
        }
        return newMessages
      })
      setArtifact(mockArtifact)
    }, 2000)
  }

  const handleCategoryToggle = (signalId: string, category: "Activity" | "Outcome") => {
    if (!artifact) return
    setArtifact({
      ...artifact,
      signals: artifact.signals.map((s) => (s.id === signalId ? { ...s, category } : s)),
    })
  }

  const handleDeleteSignal = (signalId: string) => {
    if (!artifact) return
    setArtifact({
      ...artifact,
      signals: artifact.signals.filter((s) => s.id !== signalId),
    })
  }

  const handleCreateAgent = () => {
    if (!artifact) return
    setShowActivateModal(true)
  }

  const handleSaveAsDraft = () => {
    setShowActivateModal(false)
    router.push("/agents")
  }

  const handleActivateAgent = () => {
    if (!artifact) return
    const params = new URLSearchParams({
      name: artifact.agentName,
      description: artifact.agentDescription,
      code: `AGENT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      signals: JSON.stringify(artifact.signals),
    })
    setShowActivateModal(false)
    router.push(`/agents/new/manual/signals?${params.toString()}`)
  }

  const handleTemplateClick = (template: string) => {
    setInput(template)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="p-8 min-h-screen">
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
          <div className="fixed inset-0 bg-background/80" onClick={() => setShowActivateModal(false)} />
          <div className="relative bg-background border border-border rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <button
              onClick={() => setShowActivateModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold mb-2">Activate agent?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Would you like to activate this agent now or save it as a draft?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveAsDraft}>
                Save as draft
              </Button>
              <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={handleActivateAgent}>
                Activate agent
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
          Agents
        </Link>
        <span className="text-muted-foreground">&gt;</span>
        <Link href="/agents/new" className="text-muted-foreground hover:text-foreground transition-colors">
          New
        </Link>
        <span className="text-muted-foreground">&gt;</span>
        <span>Ask Paid</span>
      </div>

      <div className="border-b border-border -mx-8 mb-8" />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        {!hasMessages ? (
          /* Initial State */
          <div className="flex flex-col items-center pt-24">
            <h1 className="text-2xl font-semibold mb-2">Describe your AI agent</h1>
            <p className="text-muted-foreground mb-8">And we&apos;ll figure out how to monetize it.</p>

            {/* Input Area */}
            <div className="w-full border border-border rounded-lg p-4 mb-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try describing your agent in natural language, or pasting some links..."
                className="w-full bg-transparent resize-none outline-none min-h-[100px] text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  className="rounded-full bg-muted hover:bg-muted/80"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Templates */}
            <p className="text-muted-foreground text-sm mb-4">or use a template...</p>
            <div className="flex flex-wrap justify-center gap-2">
              {templates.map((template) => (
                <Button
                  key={template.label}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full bg-transparent"
                  onClick={() => handleTemplateClick(template.label)}
                >
                  <template.icon className="h-4 w-4" />
                  {template.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat State */
          <div className="flex flex-col pt-8">
            {/* Messages */}
            <div className="flex-1 space-y-6 mb-8">
              {messages.map((message, index) => (
                <div key={index}>
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-foreground text-background">
                        {message.content}
                      </div>
                    </div>
                  ) : message.isLoading ? (
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-mono">Generating artifact ...</span>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ) : message.artifact ? (
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-mono">Generated artifact</span>
                      </div>

                      {/* Agent Info */}
                      <div className="border-l-2 border-border pl-4 mb-6 space-y-3">
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                          <span className="text-sm font-medium">Agent name</span>
                          <span className="text-sm text-muted-foreground">{artifact?.agentName}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                          <span className="text-sm font-medium">Agent description</span>
                          <span className="text-sm text-muted-foreground">{artifact?.agentDescription}</span>
                        </div>
                      </div>

                      {/* Signals Table */}
                      <div className="border-l-2 border-border pl-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_150px_80px_40px] gap-4 mb-3">
                          <span className="text-sm font-medium">Title</span>
                          <span className="text-sm font-medium">Category</span>
                          <span className="text-sm font-medium text-amber-600">HVE</span>
                          <span></span>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-2">
                          {artifact?.signals.map((signal) => (
                            <div
                              key={signal.id}
                              className="grid grid-cols-[1fr_150px_80px_40px] gap-4 items-center py-2 border-b border-border/50 last:border-0"
                            >
                              <span className="text-sm text-muted-foreground">{signal.title}</span>
                              <div className="flex">
                                <button
                                  className={cn(
                                    "px-3 py-1 text-xs font-medium border border-r-0 rounded-l transition-colors",
                                    signal.category === "Activity"
                                      ? "bg-foreground text-background border-foreground"
                                      : "bg-transparent text-foreground border-border",
                                  )}
                                  onClick={() => handleCategoryToggle(signal.id, "Activity")}
                                >
                                  Activity
                                </button>
                                <button
                                  className={cn(
                                    "px-3 py-1 text-xs font-medium border rounded-r transition-colors",
                                    signal.category === "Outcome"
                                      ? "bg-foreground text-background border-foreground"
                                      : "bg-transparent text-foreground border-border",
                                  )}
                                  onClick={() => handleCategoryToggle(signal.id, "Outcome")}
                                >
                                  Outcome
                                </button>
                              </div>
                              <span className="text-sm">${signal.hve.toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleDeleteSignal(signal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Create Agent Button */}
                        <div className="flex justify-end mt-6">
                          <Button
                            className="bg-foreground text-background hover:bg-foreground/90"
                            onClick={handleCreateAgent}
                          >
                            Create this agent
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border border-border rounded-lg p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-transparent resize-none outline-none min-h-[60px] text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <Button
                  size="icon"
                  className="rounded-full bg-muted hover:bg-muted/80"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
