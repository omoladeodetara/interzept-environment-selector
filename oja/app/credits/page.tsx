import { Sidebar } from "@/components/sidebar"
import { CreditsContent } from "@/components/credits-content"

export default function CreditsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[240px]">
        <CreditsContent />
      </main>
    </div>
  )
}
