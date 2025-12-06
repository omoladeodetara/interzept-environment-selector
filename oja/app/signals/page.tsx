import { Suspense } from "react"
import { SignalsContent } from "@/components/signals-content"

export default function SignalsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SignalsContent />
    </Suspense>
  )
}
