import { Suspense } from "react"
import { AgentPricingContent } from "@/components/agent-pricing-content"

export default function AgentPricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AgentPricingContent />
    </Suspense>
  )
}
