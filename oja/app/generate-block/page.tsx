"use client"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  ChevronDown,
  Code,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Info,
  Mic,
  Monitor,
  Share2,
  TrendingUp,
  Users,
  Zap,
  X,
} from "lucide-react"
import { Button } from '@lastprice/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@lastprice/ui'

const codeFiles = [
  {
    name: "App.tsx",
    content: [
      "import './screenshotBridge.ts';",
      "import React, { useState } from 'react';",
      "import './styles.css';",
      "import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';",
      "import { Button } from './components/ui/button';",
      "import { Badge } from './components/ui/badge';",
      "import { Check, Info, TrendingUp, Zap } from 'lucide-react';",
      "",
      "// HARDCODED pricing data based on the SQL query results",
      "const PRICING_DATA = {",
      "  signals: [",
      "    {",
      "      id: 'chat_prompt',",
      "      name: 'Chat Prompt Usage',",
      "      unitPrice: 100, // $1.00 per unit (100 cents)",
      "      includedQuantity: 0,",
      "      minQuantity: 0,",
      "      description: 'Each AI chat prompt processed by your agent'",
      "    }",
      "  ],",
      "  basePrice: 0 // No base subscription, pure usage-based",
      "};",
      "",
      "// Purchase handler (will be injected by install-block tool)",
      "const handleBuyPlan = (planId: string, name: string, price: number) => {",
      "  /* PRICING_PURCHASE_PLACEHOLDER */",
      "  console.log('Plan selected:', { planId, name, price });",
      "  alert('Stripe payment will be enabled after installation. Run: npx @paid-ai/install-block');",
      "};",
    ].join("\n"),
  },
]

function highlightCode(code: string) {
  const lines = code.split("\n")
  return lines.map((line, lineIndex) => {
    // Tokenize the line
    const highlighted = line
      // Comments
      .replace(/(\/\/.*$)/g, '<span class="text-gray-500">$1</span>')
      .replace(/(\/\*.*?\*\/)/g, '<span class="text-gray-500">$1</span>')
      // Strings
      .replace(/('[^']*')/g, '<span class="text-amber-400">$1</span>')
      .replace(/("[^"]*")/g, '<span class="text-amber-400">$1</span>')
      .replace(/(\`[^\`]*\`)/g, '<span class="text-amber-400">$1</span>')
      // Keywords
      .replace(
        /\b(import|export|from|const|let|var|function|return|if|else|default|new|typeof|async|await)\b/g,
        '<span class="text-purple-400">$1</span>',
      )
      // React/Types
      .replace(/\b(React|useState|useEffect|useRef)\b/g, '<span class="text-blue-400">$1</span>')
      // Components/Classes
      .replace(/\b([A-Z][a-zA-Z]+)(?=[\s<(])/g, '<span class="text-emerald-400">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
      // Properties after dot
      .replace(/\.([a-zA-Z_][a-zA-Z0-9_]*)/g, '.<span class="text-blue-300">$1</span>')

    return { lineNumber: lineIndex + 1, html: highlighted }
  })
}

function GenerateBlockContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get("prompt") || ""

  const [isGenerating, setIsGenerating] = useState(true)
  const [thinkingSteps, setThinkingSteps] = useState([
    { text: "Thinking", dots: "..." },
    { text: "Thinking", dots: "..." },
    { text: "Thinking", dots: "..." },
  ])
  const [dataQueryExpanded, setDataQueryExpanded] = useState(true)
  const [followUpText, setFollowUpText] = useState("")

  const [showCode, setShowCode] = useState(false)
  const [activeFile, setActiveFile] = useState("App.tsx")

  // Generated preview state
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  const [usageValue, setUsageValue] = useState(100)

  // Dropdown states
  const [showShareDropdown, setShowShareDropdown] = useState(false)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false)
  const [showVersionDropdown, setShowVersionDropdown] = useState(false)
  const [copiedNpx, setCopiedNpx] = useState(false)

  // Simulate thinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingSteps((steps) =>
        steps.map((step) => ({
          ...step,
          dots: step.dots.length >= 3 ? "." : step.dots + ".",
        })),
      )
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const aiResponse =
    "Generated an interactive pricing calculator with real-time cost calculation, usage sliders, cost breakdown, monthly/annual billing toggle, and visual cost indicators for usage-based pricing."

  // Calculate costs
  const monthlyBaseCost = usageValue * 1
  const annualCost = monthlyBaseCost * 12
  const annualDiscount = Math.round(annualCost * 0.17)
  const annualTotal = annualCost - annualDiscount

  const calculateCost = () => {
    return billingPeriod === "annual" ? annualTotal : monthlyBaseCost
  }

  const presetValues = [100, 500, 1000, 2500, 5000]

  const activeFileContent = codeFiles.find((f) => f.name === activeFile)?.content || ""
  const highlightedLines = highlightCode(activeFileContent)

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Dark */}
      <div className="w-[540px] bg-[#1a1a1a] text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link href="/monetization">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <span className="font-medium">Generate block</span>
          </div>
          {/* Version Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:bg-white/10"
              onClick={() => setShowVersionDropdown(!showVersionDropdown)}
            >
              <Info className="h-4 w-4" />
            </Button>
            {showVersionDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-50 min-w-[160px]">
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/90">
                    <span className="font-medium">Version 1</span>
                    <span className="text-white/50 text-xs">(Latest)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Prompt Card */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 text-sm leading-relaxed">
            {prompt.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "mt-1" : ""}>
                {line}
              </p>
            ))}
          </div>

          {!isGenerating && (
            <div className="bg-[#2a2a2a] border border-emerald-500/50 rounded-lg p-4 text-sm leading-relaxed">
              {aiResponse}
            </div>
          )}

          {/* Data Query Section - only show when generating */}
          {isGenerating && (
            <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
              <button
                onClick={() => setDataQueryExpanded(!dataQueryExpanded)}
                className="w-full flex items-center justify-between p-3 text-sm hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className={"h-4 w-4 transition-transform " + (dataQueryExpanded ? "rotate-90" : "")} />
                  <span>Data query</span>
                </div>
                <div className="h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              </button>

              {dataQueryExpanded && (
                <div className="px-4 pb-3 space-y-1">
                  {thinkingSteps.map((step, i) => (
                    <div key={i} className="text-sm text-white/70">
                      <span className="text-white/50">{step.text}:</span> {step.dots}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Input */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <textarea
      value={followUpText}
      onChange={(e) => setFollowUpText(e.target.value)}
      placeholder="Describe your block or ask for changes..."
      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 pr-20 text-sm text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[80px]"
    />
    <div className="absolute bottom-3 right-3 flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10">
        <Mic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={"h-8 w-8 " + (followUpText ? "text-white hover:bg-white/10" : "text-white/20")}
        disabled={!followUpText}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
      </div>

      {/* Right Side - Light (with Code View) */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
  {isGenerating ? (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Crafting your block</h2>
        <p className="text-sm text-muted-foreground">Usually takes 20 seconds at most</p>
      </div>
      <div className="mt-6">
        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    </div>
  ) : (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 p-4 border-b">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setShowCode(!showCode)}>
          {showCode ? <Monitor className="h-4 w-4" /> : <Code className="h-4 w-4" />}
          {showCode ? "Hide code" : "Show code"}
        </Button>

        {/* Share Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Share2 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-pointer">
              <Users className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-medium">Share with invite</div>
                <div className="text-xs text-muted-foreground">Recipients can join your organization</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-pointer">
              <Eye className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-medium">Share view-only</div>
                <div className="text-xs text-muted-foreground">Recipients can view but not join</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Download Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Download className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Code className="h-4 w-4" />
                Add to codebase
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Run this command in your terminal. You'll be prompted for an API key.
              </p>
              <div className="mt-2 bg-muted rounded-md px-3 py-2 font-mono text-xs text-muted-foreground flex items-center justify-between">
                <span className="truncate">npx @paid-ai/install-block ...</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-3 py-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              <span>Download ZIP</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 py-2 cursor-pointer">
              <ImageIcon className="h-4 w-4" />
              <span>Download PNG</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 py-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              <span>Download PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Panel */}
        {showCode && (
          <div className="w-1/2 flex flex-col border-r bg-[#1e1e1e] text-white">
            {/* File Tabs */}
            <div className="flex items-center border-b border-white/10 overflow-x-auto">
              {codeFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={"flex items-center gap-2 px-4 py-2 text-sm border-r border-white/10 whitespace-nowrap " + (
                    activeFile === file.name
                      ? "bg-[#2d2d2d] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {file.name}
                  {activeFile === file.name && <X className="h-3 w-3 text-white/40 hover:text-white" />}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto font-mono text-sm">
              <div className="min-w-max">
                {highlightedLines.map((line) => (
                  <div key={line.lineNumber} className="flex hover:bg-white/5">
                    <span className="w-12 px-3 py-0.5 text-right text-white/30 select-none border-r border-white/10">
                      {line.lineNumber}
                    </span>
                    <pre className="flex-1 px-4 py-0.5" dangerouslySetInnerHTML={{ __html: line.html || "&nbsp;" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className={(showCode ? "w-1/2" : "flex-1") + " overflow-auto p-8"}>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Pricing Calculator</h1>
              <p className="text-muted-foreground">Estimate your monthly costs based on usage</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={"px-4 py-2 text-sm font-medium rounded-md transition-colors " + (
                    billingPeriod === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("annual")}
                  className={"px-4 py-2 text-sm font-medium rounded-md transition-colors " + (
                    billingPeriod === "annual" ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Annual
                </button>
                <span className="px-2 py-1 ml-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded">
                  Save 17%
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className={"grid " + (showCode ? "grid-cols-1" : "grid-cols-3") + " gap-6"}>
              {/* Usage Configuration */}
              <div className={showCode ? "" : "col-span-2"}>
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">Usage Configuration</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adjust your expected monthly usage to see real-time cost estimates
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Chat Prompt Usage</span>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{usageValue.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-1">units/month</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={10000}
                      step={100}
                      value={usageValue}
                      onChange={(e) => setUsageValue(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>5,000</span>
                      <span>10,000</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {presetValues.map((value) => (
                        <button
                          key={value}
                          onClick={() => setUsageValue(value)}
                          className={"px-3 py-1 text-sm rounded-md border transition-colors " + (
                            usageValue === value ? "bg-foreground text-background border-foreground" : "hover:bg-muted"
                          )}
                        >
                          {value.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Cost Card */}
              {!showCode && (
                <div className="border rounded-lg p-6 h-fit space-y-4">
                  <div>
                    <h3 className="font-semibold">Estimated Cost</h3>
                    <p className="text-sm text-muted-foreground">
                      {billingPeriod === "monthly" ? "Monthly billing" : "Annual billing with discount"}
                    </p>
                  </div>

                  <div>
                    <div className="text-4xl font-bold">
                      {"$" + (billingPeriod === "annual" ? annualTotal.toLocaleString() : monthlyBaseCost.toLocaleString())}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {billingPeriod === "annual" ? "per year" : "per month"}
                    </div>
                  </div>

                  {/* Annual Savings Box - only show for annual */}
                  {billingPeriod === "annual" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-emerald-700">Annual Savings</div>
                        <div className="text-xs text-emerald-600">Equivalent to 2 months free!</div>
                      </div>
                      <div className="text-lg font-bold text-emerald-700">{"$" + annualDiscount.toLocaleString()}</div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Cost</span>
                      <span className="font-medium">{"$" + monthlyBaseCost.toLocaleString()}</span>
                    </div>
                    {billingPeriod === "annual" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Cost (12 months)</span>
                          <span className="font-medium">{"$" + annualCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="font-medium text-emerald-600">{"-$" + annualDiscount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button className="w-full bg-violet-600 hover:bg-violet-700">Get Started</Button>

                  <p className="text-xs text-center text-muted-foreground">No setup fees · Cancel anytime</p>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Cost Breakdown</h3>
              </div>
              <p className="text-sm text-muted-foreground">Detailed breakdown of your monthly costs</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <div className="font-medium">Chat Prompt Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {usageValue.toLocaleString()} billable units · $1/unit
                    </div>
                  </div>
                  <div className="font-semibold">{"$" + usageValue.toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="font-semibold">Monthly Total</div>
                  <div className="text-xl font-bold">{"$" + monthlyBaseCost.toLocaleString()}</div>
                </div>

                {billingPeriod === "annual" && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="font-semibold">Annual Total</div>
                    <div className="text-xl font-bold">{"$" + annualTotal.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
</div>
  )
}

export default function GenerateBlockPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <GenerateBlockContent />
    </Suspense>
  )
}
