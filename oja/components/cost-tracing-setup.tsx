"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Plus, Bot, Sparkles, Terminal, Code, GitMerge, Copy, Check, Circle, X } from "lucide-react"

const languages = ["Node.js", "Python", "Go", "Ruby"]

const frameworks = [
  {
    id: "vercel",
    name: "Vercel",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4L20 18H4L12 4Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "langchain",
    name: "LangChain",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "llamaindex",
    name: "LlamaIndex",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4C8 4 5 7 5 11C5 15 8 18 12 18C16 18 19 15 19 11"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="11" r="3" fill="#10B981" />
      </svg>
    ),
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4L4 20H9L12 14L15 20H20L12 4Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "request",
    name: "Request",
    icon: <Plus className="h-5 w-5" />,
  },
]

const accordionSections = [
  {
    id: "configure",
    icon: <Bot className="h-5 w-5 text-amber-500" />,
    title: "Configure an agent with pricing signals in Paid",
    description: "Use a prebuilt agent config or provide a site that explains what your agent does.",
  },
  {
    id: "prompt",
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    title: "prompt", // placeholder, actual title computed dynamically
    description: "Paste it into Cursor, VS Code, CodePilot, or any AI coding assistant.",
  },
  {
    id: "npx",
    icon: <Terminal className="h-5 w-5 text-blue-500" />,
    title: "NPX command",
    description: "Quick setup using our NPX command line tool.",
  },
  {
    id: "manual",
    icon: <Code className="h-5 w-5 text-orange-500" />,
    title: "manual", // placeholder, actual title computed dynamically
    description: "Install dependencies and configure your environment step by step.",
  },
  {
    id: "verify",
    icon: <GitMerge className="h-5 w-5 text-pink-500" />,
    title: "Verify integration",
    description: "Send signals and traces, verify that everything is working",
  },
]

function CostTracingSetup() {
  const [selectedLanguage, setSelectedLanguage] = useState("Node.js")
  const [selectedFramework, setSelectedFramework] = useState("vercel")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [copiedNpx, setCopiedNpx] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [isReconfiguring, setIsReconfiguring] = useState(false)
  const [webAddress, setWebAddress] = useState("")
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [creationStep, setCreationStep] = useState(0)

  useEffect(() => {
    if (isCreating && creationStep < 3) {
      const timer = setTimeout(() => {
        setCreationStep((prev) => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    }
    if (creationStep >= 3) {
      setTimeout(() => {
        setIsCreating(false)
        setIsReconfiguring(false)
        setCreationStep(0)
      }, 1000)
    }
  }, [isCreating, creationStep])

  const handleCreate = () => {
    setIsCreating(true)
    setCreationStep(0)
  }

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const npxCommand = "npx @paid-ai/instrument-repo"

  const getCodeExample = () => {
    const genText = "generate" + "Text"
    const aiSdk = "@ai-sdk/" + "openai"
    return `import { ${genText} } from 'ai';
import { openai } from '${aiSdk}';
import { PaidClient } from '@paid-ai/paid-node';

const client = new PaidClient({ token: "116c875f-bf85-4332-897a-e294c42158bf" });
await client.initializeTracing();

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Trace AI calls to track costs
  return await client.trace("onboarding-test-customer", async () => {
    const result = await ${genText}({
      model: openai('gpt-4'),
      messages,
    });

    return Response.json({ text: result.text });
  });
}`
  }

  const jsonTemplate = `{
  "agent": {
    "name": "ai-sdk-chatbot",
    "description": "A chatbot",
    "productCode": "ai-assistant-v1",
    "externalId": "ai-sdk-chatbot-id"
  },
  "agentSignal": {
    "name": "ai-sdk-chatbot",
    "description": "A chatbot",
    "productCode": "ai-assistant-v1",
    "externalId": "ai-sdk-chatbot-id",
    "active": true,
    "ProductAttribute": [
      {
        "name": "using_chat_prompt",
        "pricing": {
          "eventName": "using_chat_prompt",
          "chargeType": "usage",
          "unitValue": 10,
          "signalType": "activity",
          "pricingModel": "PerUnit",
          "billingFrequency": "monthly",
          "PricePoints": {
            "USD": {
              "unitPrice": 100
            }
          },
          "additionalProperties": [
            {
              "valueName": "quantity",
              "valuePathRef": "$.quantity"
            }
          ]
        }
      }
    ]
  }
}`

  const renderAccordionContent = (sectionId: string) => {
    switch (sectionId) {
      case "configure":
        if (isCreating) {
          return (
            <div className="space-y-6 p-6">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="mb-3 h-6 w-6 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h2M17 12h2M12 5v2M12 17v2M7.05 7.05l1.414 1.414M15.536 15.536l1.414 1.414M7.05 16.95l1.414-1.414M15.536 8.464l1.414-1.414" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Setting up your demo environment...</p>
              </div>
              <div className="space-y-3">
                {/* API Key */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${creationStep >= 1 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {creationStep >= 1 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">API Key</p>
                      <p className={`text-xs ${creationStep >= 1 ? "text-emerald-600" : "text-gray-400"}`}>
                        {creationStep >= 1 ? "Created" : "Pending"}
                      </p>
                    </div>
                  </div>
                  {creationStep >= 1 && <Check className="h-4 w-4 text-emerald-500" />}
                </div>
                {/* Agent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${creationStep >= 2 ? "bg-emerald-100 text-emerald-600" : creationStep === 1 ? "bg-cyan-100 text-cyan-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {creationStep >= 2 ? (
                        <Check className="h-3 w-3" />
                      ) : creationStep === 1 ? (
                        <Bot className="h-3 w-3" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Agent</p>
                      <p
                        className={`text-xs ${creationStep >= 2 ? "text-emerald-600" : creationStep === 1 ? "text-cyan-600" : "text-gray-400"}`}
                      >
                        {creationStep >= 2 ? "Created" : creationStep === 1 ? "Creating..." : "Not created"}
                      </p>
                    </div>
                  </div>
                  {creationStep === 1 && (
                    <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {creationStep >= 2 && <Check className="h-4 w-4 text-emerald-500" />}
                </div>
                {/* Customer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${creationStep >= 3 ? "bg-emerald-100 text-emerald-600" : creationStep === 2 ? "bg-cyan-100 text-cyan-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {creationStep >= 3 ? (
                        <Check className="h-3 w-3" />
                      ) : creationStep === 2 ? (
                        <Circle className="h-3 w-3" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer</p>
                      <p
                        className={`text-xs ${creationStep >= 3 ? "text-emerald-600" : creationStep === 2 ? "text-cyan-600" : "text-gray-400"}`}
                      >
                        {creationStep >= 3 ? "Created" : creationStep === 2 ? "Creating..." : "Not created"}
                      </p>
                    </div>
                  </div>
                  {creationStep === 2 && (
                    <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {creationStep >= 3 && <Check className="h-4 w-4 text-emerald-500" />}
                </div>
              </div>
            </div>
          )
        }
        if (isReconfiguring) {
          return (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webAddress}
                  onChange={(e) => setWebAddress(e.target.value)}
                  placeholder="Enter a public web address to generate an agent pricing configuration (optional)"
                  className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0"
                />
                <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50">
                  Generate
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowCustomizeModal(true)}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Customize config
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Create
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )
        }
        return (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Setup complete</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Agent: <span className="text-blue-600">ai-sdk-chatbot</span>
                </span>
              </div>
              <button
                onClick={() => setIsReconfiguring(true)}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Reconfigure
              </button>
            </div>
          </div>
        )
      case "prompt":
        return (
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 fill-gray-900 text-gray-900" />
                <span className="text-sm text-gray-700">Custom Vercel prompt: Node.js + Vercel</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard("Custom Vercel prompt for Node.js", setCopiedPrompt)}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  {copiedPrompt ? "Copied!" : "Copy prompt"}
                </button>
                <button
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    copiedPrompt
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Open Cursor
                </button>
              </div>
            </div>
          </div>
        )
      case "npx":
        return (
          <div className="p-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3">
              <code className="text-sm text-white">
                <span className="text-gray-400">npx</span>{" "}
                <span className="text-cyan-400">@paid-ai/instrument-repo</span>
              </code>
              <button
                onClick={() => copyToClipboard(npxCommand, setCopiedNpx)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                {copiedNpx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )
      case "manual":
        const genTextDisplay = "generate" + "Text"
        return (
          <div className="p-4">
            <p className="mb-4 text-sm text-gray-600">
              Integrate <span className="text-amber-600">cost tracking</span> with Vercel AI SDK for{" "}
              <span className="text-amber-600">text generation</span>
            </p>
            <div className="relative overflow-hidden rounded-lg bg-gray-900">
              <button
                onClick={() => copyToClipboard(getCodeExample(), setCopiedCode)}
                className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-white"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <pre className="overflow-x-auto p-4 text-sm leading-6">
                <code>
                  <span className="text-purple-400">import</span> <span className="text-gray-300">{"{ "}</span>
                  <span className="text-yellow-300">{genTextDisplay}</span>
                  <span className="text-gray-300">{" }"}</span> <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'ai'</span>
                  <span className="text-gray-300">;</span>
                  {"\n"}
                  <span className="text-purple-400">import</span> <span className="text-gray-300">{"{ "}</span>
                  <span className="text-yellow-300">openai</span>
                  <span className="text-gray-300">{" }"}</span> <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'@ai-sdk/openai'</span>
                  <span className="text-gray-300">;</span>
                  {"\n"}
                  <span className="text-purple-400">import</span> <span className="text-gray-300">{"{ "}</span>
                  <span className="text-yellow-300">PaidClient</span>
                  <span className="text-gray-300">{" }"}</span> <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'@paid-ai/paid-node'</span>
                  <span className="text-gray-300">;</span>
                  {"\n\n"}
                  <span className="text-purple-400">const</span> <span className="text-blue-300">client</span>{" "}
                  <span className="text-gray-300">=</span> <span className="text-purple-400">new</span>{" "}
                  <span className="text-yellow-300">PaidClient</span>
                  <span className="text-gray-300">({"{ "}</span>
                  <span className="text-blue-300">token</span>
                  <span className="text-gray-300">:</span>{" "}
                  <span className="text-green-400">"116c875f-bf85-4332-897a-e294c42158bf"</span>
                  <span className="text-gray-300">{" }"});</span>
                  {"\n"}
                  <span className="text-purple-400">await</span> <span className="text-blue-300">client</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">initializeTracing</span>
                  <span className="text-gray-300">();</span>
                  {"\n\n"}
                  <span className="text-purple-400">export</span> <span className="text-purple-400">async</span>{" "}
                  <span className="text-purple-400">function</span> <span className="text-yellow-300">POST</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-blue-300">req</span>
                  <span className="text-gray-300">:</span> <span className="text-yellow-300">Request</span>
                  <span className="text-gray-300">)</span> <span className="text-gray-300">{"{"}</span>
                  {"\n"}
                  <span className="text-gray-300">{"  "}</span>
                  <span className="text-purple-400">const</span> <span className="text-gray-300">{"{ "}</span>
                  <span className="text-blue-300">messages</span>
                  <span className="text-gray-300">{" }"}</span> <span className="text-gray-300">=</span>{" "}
                  <span className="text-purple-400">await</span> <span className="text-blue-300">req</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">json</span>
                  <span className="text-gray-300">();</span>
                  {"\n\n"}
                  <span className="text-gray-300">{"  "}</span>
                  <span className="text-gray-500">{"// Trace AI calls to track costs"}</span>
                  {"\n"}
                  <span className="text-gray-300">{"  "}</span>
                  <span className="text-purple-400">return</span> <span className="text-purple-400">await</span>{" "}
                  <span className="text-blue-300">client</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">trace</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-green-400">"onboarding-test-customer"</span>
                  <span className="text-gray-300">,</span> <span className="text-purple-400">async</span>{" "}
                  <span className="text-gray-300">() =&gt; {"{"}</span>
                  {"\n"}
                  <span className="text-gray-300">{"    "}</span>
                  <span className="text-purple-400">const</span> <span className="text-blue-300">result</span>{" "}
                  <span className="text-gray-300">=</span> <span className="text-purple-400">await</span>{" "}
                  <span className="text-yellow-300">{genTextDisplay}</span>
                  <span className="text-gray-300">({"{"}</span>
                  {"\n"}
                  <span className="text-gray-300">{"      "}</span>
                  <span className="text-blue-300">model</span>
                  <span className="text-gray-300">:</span> <span className="text-yellow-300">openai</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-green-400">'gpt-4'</span>
                  <span className="text-gray-300">),</span>
                  {"\n"}
                  <span className="text-gray-300">{"      "}</span>
                  <span className="text-blue-300">messages</span>
                  <span className="text-gray-300">,</span>
                  {"\n"}
                  <span className="text-gray-300">{"    }"});</span>
                  {"\n\n"}
                  <span className="text-gray-300">{"    "}</span>
                  <span className="text-purple-400">return</span> <span className="text-yellow-300">Response</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">json</span>
                  <span className="text-gray-300">({"{ "}</span>
                  <span className="text-blue-300">text</span>
                  <span className="text-gray-300">:</span> <span className="text-blue-300">result</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-blue-300">text</span>
                  <span className="text-gray-300">{" }"});</span>
                  {"\n"}
                  <span className="text-gray-300">{"  }"});</span>
                  {"\n"}
                  <span className="text-gray-300">{"}"}</span>
                </code>
              </pre>
            </div>
          </div>
        )
      case "verify":
        return (
          <div className="p-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-amber-50 py-12">
              <div className="mb-4 h-4 w-4 rounded-full bg-amber-400" />
              <h4 className="mb-2 text-base font-semibold text-gray-900">Waiting for cost tracking data</h4>
              <p className="max-w-md text-center text-sm text-gray-500">
                Once you implement the cost tracking code and start making AI model calls, the cost and usage data will
                appear here automatically.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getAccordionTitle = (sectionId: string) => {
    const selectedFrameworkName = frameworks.find((f) => f.id === selectedFramework)?.name || "Vercel"

    if (sectionId === "prompt") {
      return `Use this prebuilt prompt for ${selectedLanguage} + ${selectedFrameworkName}`
    }
    if (sectionId === "manual") {
      return `Manual setup guide for ${selectedLanguage.toLowerCase()} + ${selectedFrameworkName.toLowerCase()}`
    }
    return accordionSections.find((s) => s.id === sectionId)?.title || ""
  }

  return (
    <div className="min-h-screen bg-white">
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-16">
          <div className="relative mx-4 w-full max-w-3xl rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customize entity templates</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Edit the JSON below to customize your agent config. This can be changed later too.
                </p>
              </div>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Code Editor */}
            <div className="px-6 py-4">
              <div className="relative overflow-hidden rounded-lg bg-gray-900">
                <button
                  onClick={() => copyToClipboard(jsonTemplate, setCopiedTemplate)}
                  className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-white"
                >
                  {copiedTemplate ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="max-h-[400px] overflow-auto p-4 text-sm leading-6">
                  <code>
                    {jsonTemplate.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="mr-4 w-6 text-right text-gray-500">{i + 1}</span>
                        <span>
                          {line.split(/(".*?":?|true|false|\d+|\[|\]|\{|\}|,)/g).map((part, j) => {
                            if (part.match(/^".*":$/)) {
                              return (
                                <span key={j} className="text-purple-400">
                                  {part}
                                </span>
                              )
                            } else if (part.match(/^".*"$/)) {
                              return (
                                <span key={j} className="text-green-400">
                                  {part}
                                </span>
                              )
                            } else if (part === "true" || part === "false") {
                              return (
                                <span key={j} className="text-orange-400">
                                  {part}
                                </span>
                              )
                            } else if (part.match(/^\d+$/)) {
                              return (
                                <span key={j} className="text-cyan-400">
                                  {part}
                                </span>
                              )
                            }
                            return (
                              <span key={j} className="text-gray-300">
                                {part}
                              </span>
                            )
                          })}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Save templates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <Link
          href="/get-started"
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to workflows
        </Link>
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Finish
        </Link>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">Setup cost tracing</h1>
          <p className="text-gray-500">Install, connect, and trace in minutes.</p>
        </div>

        {/* Language Tabs */}
        <div className="mb-8 flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedLanguage === lang
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Framework Selection */}
        <div className="mb-8 rounded-lg border border-gray-200 p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Select your framework</h2>
          <p className="mb-6 text-sm text-gray-500">
            Choose your <span className="text-amber-600">platform</span> to generate setup code for your environment.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
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
                <span className="mb-3 text-gray-700">{framework.icon}</span>
                <span className="text-sm font-medium text-gray-900">{framework.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {accordionSections.map((section) => (
            <div key={section.id} className="overflow-hidden rounded-lg border border-gray-200">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">{section.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {section.id === "prompt" || section.id === "manual"
                        ? getAccordionTitle(section.id)
                        : section.title}
                    </h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                    expandedSection === section.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSection === section.id && (
                <div className="border-t border-gray-200">{renderAccordionContent(section.id)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CostTracingSetup
