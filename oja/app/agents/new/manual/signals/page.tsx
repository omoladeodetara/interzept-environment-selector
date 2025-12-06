import { Suspense } from "react"
import { AgentSignalsContent } from "@/components/agent-signals-content"

export default function AgentSignalsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AgentSignalsContent />
    </Suspense>
  )
}
