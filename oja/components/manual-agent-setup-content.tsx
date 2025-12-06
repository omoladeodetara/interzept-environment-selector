"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Input } from '@lastprice/ui'
import { Button } from '@lastprice/ui'

export function ManualAgentSetupContent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    agentName: "",
    description: "",
    agentCode: "",
    externalId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      name: formData.agentName,
      code: formData.agentCode,
      description: formData.description,
      externalId: formData.externalId,
    })
    router.push(`/agents/new/manual/signals?${params.toString()}`)
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-16">
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
        <span>New</span>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold mb-6">Create agent</h1>

          <Input
            placeholder="Agent name"
            value={formData.agentName}
            onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
            className="bg-muted/50 border-0 h-12"
          />

          <Input
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-muted/50 border-0 h-12"
          />

          <Input
            placeholder="Agent code"
            value={formData.agentCode}
            onChange={(e) => setFormData({ ...formData, agentCode: e.target.value })}
            className="bg-muted/50 border-0 h-12"
          />

          <Input
            placeholder="External ID"
            value={formData.externalId}
            onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
            className="bg-muted/50 border-0 h-12"
          />

          <Button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 mt-6">
            <span className="mr-2">NEXT :</span>
            <span className="font-semibold">SIGNALS</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
