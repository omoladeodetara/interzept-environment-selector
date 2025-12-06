"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Pencil,
  ArrowRight,
  Copy,
  Users,
  Terminal,
  Code,
  Sliders,
  X,
} from "lucide-react"

const languages = ["Node.js", "Python", "Go", "Ruby"]

const frameworks = [
  {
    id: "vercel",
    name: "Vercel",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 2L2 19.5h20L12 2z" />
      </svg>
    ),
  },
  {
    id: "langchain",
    name: "LangChain",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <rect x="4" y="8" width="6" height="8" rx="1" />
        <rect x="14" y="8" width="6" height="8" rx="1" />
      </svg>
    ),
  },
  {
    id: "llamaindex",
    name: "LlamaIndex",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  { id: "anthropic", name: "Anthropic", icon: <span className="text-xl font-bold">A</span> },
  { id: "request", name: "Request", icon: <span className="text-2xl">+</span> },
]

function toggleAccordion(id: string, openAccordion: string | null, setOpenAccordion: (id: string | null) => void) {
  setOpenAccordion(openAccordion === id ? null : id)
}

export function EventTrackingSetup() {
  const [selectedLanguage, setSelectedLanguage] = useState("Node.js")
  const [selectedFramework, setSelectedFramework] = useState("vercel")
  const [openAccordion, setOpenAccordion] = useState<string | null>("configure")
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [creatingStep, setCreatingStep] = useState(0)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedNpx, setCopiedNpx] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    if (isCreating) {
      const timer1 = setTimeout(() => setCreatingStep(1), 800)
      const timer2 = setTimeout(() => setCreatingStep(2), 1600)
      const timer3 = setTimeout(() => {
        setCreatingStep(3)
        setTimeout(() => {
          setIsCreating(false)
          setIsConfiguring(false)
          setCreatingStep(0)
        }, 500)
      }, 2400)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isCreating])

  const handleCreate = () => {
    setIsCreating(true)
    setCreatingStep(0)
  }

  const getFrameworkName = () => {
    const framework = frameworks.find((f) => f.id === selectedFramework)
    return framework?.name || "Vercel"
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(`Custom ${getFrameworkName()} prompt: ${selectedLanguage} + ${getFrameworkName()}`)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const handleCopyNpx = () => {
    navigator.clipboard.writeText("npx @paid-ai/instrument-repo")
    setCopiedNpx(true)
    setTimeout(() => setCopiedNpx(false), 2000)
  }

  const handleCopyCode = () => {
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customize entity templates</h2>
                <p className="text-sm text-gray-500">
                  Edit the JSON below to customize your agent config. This can be changed later too.
                </p>
              </div>
              <button onClick={() => setShowCustomizeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-auto">
              <div className="relative rounded-lg bg-gray-900 m-4">
                <button className="absolute right-4 top-4 text-gray-400 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
                <pre className="p-4 text-sm leading-6 overflow-x-auto">
                  <code>
                    <span className="text-gray-500">1 </span>
                    <span className="text-white">{"{"}</span>
                    {"\n"}
                    <span className="text-gray-500">2 </span> <span className="text-cyan-300">&quot;agent&quot;</span>
                    <span className="text-white">: {"{"}</span>
                    {"\n"}
                    <span className="text-gray-500">3 </span> <span className="text-cyan-300">&quot;name&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;ai-sdk-chatbot&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">4 </span>{" "}
                    <span className="text-cyan-300">&quot;description&quot;</span>
                    <span className="text-white">:</span> <span className="text-green-400">&quot;A chatbot&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">5 </span>{" "}
                    <span className="text-cyan-300">&quot;productCode&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;ai-assistant-v1&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">6 </span>{" "}
                    <span className="text-cyan-300">&quot;externalId&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;ai-sdk-chatbot-id&quot;</span>
                    {"\n"}
                    <span className="text-gray-500">7 </span> <span className="text-white">{"}"},</span>
                    {"\n"}
                    <span className="text-gray-500">8 </span>{" "}
                    <span className="text-cyan-300">&quot;agentSignal&quot;</span>
                    <span className="text-white">: {"{"}</span>
                    {"\n"}
                    <span className="text-gray-500">9 </span> <span className="text-cyan-300">&quot;name&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;ai-sdk-chatbot&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">10 </span>{" "}
                    <span className="text-cyan-300">&quot;description&quot;</span>
                    <span className="text-white">:</span> <span className="text-green-400">&quot;A chatbot&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">11 </span>{" "}
                    <span className="text-cyan-300">&quot;productCode&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;ai-assistant-v1&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">12 </span>{" "}
                    <span className="text-cyan-300">&quot;externalId&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;ai-sdk-chatbot-id&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">13 </span> <span className="text-cyan-300">&quot;active&quot;</span>
                    <span className="text-white">:</span> <span className="text-orange-400">true</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">14 </span>{" "}
                    <span className="text-cyan-300">&quot;ProductAttribute&quot;</span>
                    <span className="text-white">: [</span>
                    {"\n"}
                    <span className="text-gray-500">15 </span> <span className="text-white">{"{"}</span>
                    {"\n"}
                    <span className="text-gray-500">16 </span> <span className="text-cyan-300">&quot;name&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;using_chat_prompt&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">17 </span>{" "}
                    <span className="text-cyan-300">&quot;pricing&quot;</span>
                    <span className="text-white">: {"{"}</span>
                    {"\n"}
                    <span className="text-gray-500">18 </span>{" "}
                    <span className="text-cyan-300">&quot;eventName&quot;</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-green-400">&quot;using_chat_prompt&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">19 </span>{" "}
                    <span className="text-cyan-300">&quot;chargeType&quot;</span>
                    <span className="text-white">:</span> <span className="text-green-400">&quot;usage&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">20 </span>{" "}
                    <span className="text-cyan-300">&quot;unitValue&quot;</span>
                    <span className="text-white">:</span> <span className="text-orange-400">10</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">21 </span>{" "}
                    <span className="text-cyan-300">&quot;signalType&quot;</span>
                    <span className="text-white">:</span> <span className="text-green-400">&quot;activity&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">22 </span>{" "}
                    <span className="text-cyan-300">&quot;pricingModel&quot;</span>
                    <span className="text-white">:</span> <span className="text-green-400">&quot;PerUnit&quot;</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-gray-500">23 </span>{" "}
                    <span className="text-cyan-300">&quot;billingFrequency&quot;</span>
                    <span className="text-white">:</span> <span className="text-green-400">&quot;monthly&quot;</span>
                    {"\n"}
                    <span className="text-gray-500">24 </span> <span className="text-white">{"}"}</span>
                    {"\n"}
                    <span className="text-gray-500">25 </span> <span className="text-white">{"}"}</span>
                    {"\n"}
                    <span className="text-gray-500">26 </span> <span className="text-white">]</span>
                    {"\n"}
                    <span className="text-gray-500">27 </span> <span className="text-white">{"}"}</span>
                    {"\n"}
                    <span className="text-gray-500">28 </span>
                    <span className="text-white">{"}"}</span>
                  </code>
                </pre>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Save templates
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <Link
          href="/get-started"
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to workflows
        </Link>
        <Link href="/" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Finish
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Setup event tracking</h1>
        <p className="mb-8 text-gray-500">Install, connect, and track in minutes.</p>

        <div className="mb-6 flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedLanguage === lang ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 p-6">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Select your framework</h2>
          <p className="mb-4 text-sm text-gray-500">
            Choose your platform to generate setup code for event tracking in your environment.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {frameworks.map((framework) => (
              <button
                key={framework.id}
                onClick={() => setSelectedFramework(framework.id)}
                className={`flex flex-col items-start rounded-lg border-2 p-4 transition-all ${
                  selectedFramework === framework.id
                    ? "border-gray-900 bg-white"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="mb-2 text-gray-700">{framework.icon}</span>
                <span className="text-sm font-medium text-gray-900">{framework.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("configure", openAccordion, setOpenAccordion)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-cyan-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Configure an agent with pricing signals in Paid</h3>
                  <p className="text-sm text-gray-500">
                    Use a prebuilt agent config or provide a site that explains what your agent does.
                  </p>
                </div>
              </div>
              {openAccordion === "configure" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "configure" && (
              <div className="border-t border-gray-100 p-4">
                {isCreating ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-4">
                      <span className="mb-4 text-2xl">⏳</span>
                      <p className="font-medium text-gray-900">Setting up your demo environment...</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {creatingStep >= 1 ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">API Key</p>
                            <p className={`text-sm ${creatingStep >= 1 ? "text-green-500" : "text-gray-500"}`}>
                              {creatingStep >= 1 ? "Created" : "Pending"}
                            </p>
                          </div>
                        </div>
                        {creatingStep >= 1 && <Check className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {creatingStep >= 2 ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : creatingStep === 1 ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">Agent</p>
                            <p
                              className={`text-sm ${creatingStep >= 2 ? "text-green-500" : creatingStep === 1 ? "text-cyan-500" : "text-gray-500"}`}
                            >
                              {creatingStep >= 2 ? "Created" : creatingStep === 1 ? "Creating..." : "Pending"}
                            </p>
                          </div>
                        </div>
                        {creatingStep >= 2 && <Check className="h-4 w-4 text-green-500" />}
                        {creatingStep === 1 && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {creatingStep >= 3 ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : creatingStep === 2 ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">Customer</p>
                            <p
                              className={`text-sm ${creatingStep >= 3 ? "text-green-500" : creatingStep === 2 ? "text-cyan-500" : "text-gray-500"}`}
                            >
                              {creatingStep >= 3 ? "Created" : creatingStep === 2 ? "Creating..." : "Not created"}
                            </p>
                          </div>
                        </div>
                        {creatingStep >= 3 && <Check className="h-4 w-4 text-green-500" />}
                        {creatingStep === 2 && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : !isConfiguring ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Setup complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Agent: ai-sdk-chatbot</span>
                      </div>
                      <button
                        onClick={() => setIsConfiguring(true)}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Reconfigure
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter a public web address to generate an agent pricing configuration (optional)"
                        className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                      />
                      <button className="flex items-center gap-1 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
                        Generate
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowCustomizeModal(true)}
                        className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Customize config
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Create
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("prompt", openAccordion, setOpenAccordion)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">
                    Use this prebuilt prompt for {selectedLanguage} + {getFrameworkName()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Paste it into Cursor, VS Code, CodePilot, or any AI coding assistant.
                  </p>
                </div>
              </div>
              {openAccordion === "prompt" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "prompt" && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
                      <span className="text-xs text-white">{">"}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Custom {getFrameworkName()} prompt: {selectedLanguage} + {getFrameworkName()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyPrompt}
                      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      {copiedPrompt ? "Copied!" : "Copy prompt"}
                    </button>
                    <button
                      className={`rounded-md px-4 py-2 text-sm font-medium ${copiedPrompt ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                      Open Cursor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("npx", openAccordion, setOpenAccordion)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">NPX command</h3>
                  <p className="text-sm text-gray-500">Quick setup using our NPX command line tool.</p>
                </div>
              </div>
              {openAccordion === "npx" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "npx" && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3">
                  <code className="text-sm text-white">
                    npx <span className="text-cyan-400">@paid-ai/instrument-repo</span>
                  </code>
                  <button onClick={handleCopyNpx} className="text-gray-400 hover:text-white">
                    {copiedNpx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("manual", openAccordion, setOpenAccordion)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">
                    Manual setup guide for {selectedLanguage.toLowerCase()} + {getFrameworkName().toLowerCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Install dependencies and configure your environment step by step.
                  </p>
                </div>
              </div>
              {openAccordion === "manual" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "manual" && (
              <div className="border-t border-gray-100 p-4">
                <p className="mb-4 text-sm text-gray-500">
                  Integrate event tracking with Vercel AI SDK for text generation
                </p>
                <div className="relative rounded-lg bg-gray-900 p-4">
                  <button onClick={handleCopyCode} className="absolute right-4 top-4 text-gray-400 hover:text-white">
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <pre className="text-sm leading-6">
                    <code>
                      <span className="text-gray-500">1 </span>
                      <span className="text-purple-400">import</span> <span className="text-white">{"{ "}</span>
                      <span className="text-cyan-300">{"generate" + "Text"}</span>
                      <span className="text-white">{" }"}</span> <span className="text-purple-400">from</span>{" "}
                      <span className="text-green-400">&apos;ai&apos;</span>
                      <span className="text-white">;</span>
                      {"\n"}
                      <span className="text-gray-500">2 </span>
                      <span className="text-purple-400">import</span> <span className="text-white">{"{ "}</span>
                      <span className="text-cyan-300">openai</span>
                      <span className="text-white">{" }"}</span> <span className="text-purple-400">from</span>{" "}
                      <span className="text-green-400">&apos;@ai-sdk/openai&apos;</span>
                      <span className="text-white">;</span>
                      {"\n"}
                      <span className="text-gray-500">3 </span>
                      <span className="text-purple-400">import</span> <span className="text-white">{"{ "}</span>
                      <span className="text-cyan-300">PaidClient</span>
                      <span className="text-white">{" }"}</span> <span className="text-purple-400">from</span>{" "}
                      <span className="text-green-400">&apos;@paid-ai/paid-node&apos;</span>
                      <span className="text-white">;</span>
                      {"\n"}
                      <span className="text-gray-500">4 </span>
                      {"\n"}
                      <span className="text-gray-500">5 </span>
                      <span className="text-purple-400">const</span> <span className="text-cyan-300">client</span>{" "}
                      <span className="text-white">=</span> <span className="text-purple-400">new</span>{" "}
                      <span className="text-yellow-300">PaidClient</span>
                      <span className="text-white">({"{ "}</span>
                      <span className="text-cyan-300">token</span>
                      <span className="text-white">:</span>{" "}
                      <span className="text-green-400">&quot;116c875f-bf85-4332-897a-e294c42158bf&quot;</span>{" "}
                      <span className="text-white">{"})"}</span>
                      <span className="text-white">;</span>
                      {"\n"}
                      <span className="text-gray-500">6 </span>
                      <span className="text-purple-400">await</span> <span className="text-cyan-300">client</span>
                      <span className="text-white">.</span>
                      <span className="text-yellow-300">initializeTracing</span>
                      <span className="text-white">();</span>
                      {"\n"}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("verify", openAccordion, setOpenAccordion)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Verify integration</h3>
                  <p className="text-sm text-gray-500">Send signals and traces, verify that everything is working</p>
                </div>
              </div>
              {openAccordion === "verify" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "verify" && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-amber-50 py-12">
                  <div className="mb-4 h-4 w-4 rounded-full bg-amber-400" />
                  <h4 className="mb-2 font-semibold text-gray-900">Waiting for event tracking data</h4>
                  <p className="max-w-md text-center text-sm text-gray-500">
                    Once you implement the event tracking code and start making AI model calls, the cost and usage data
                    will appear here automatically.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
