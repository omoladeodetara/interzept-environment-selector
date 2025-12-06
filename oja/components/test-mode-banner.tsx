"use client"

import { TriangleAlert } from "lucide-react"
import { useWorkspace } from "@/contexts/workspace-context"

export function TestModeBanner() {
  const { isSandbox } = useWorkspace()

  if (!isSandbox) return null

  return (
    <div className="flex items-center gap-2 bg-amber-400 px-4 py-2 text-sm text-black">
      <TriangleAlert className="h-4 w-4" />
      <span className="font-medium">Test mode</span>
      <span>
        You're in test mode. No emails will be sent, payments will not be processed, and third-party integrations are
        disabled.
      </span>
    </div>
  )
}
