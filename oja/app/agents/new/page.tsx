import { Sidebar } from "@/components/sidebar"
import { NewAgentContent } from "@/components/new-agent-content"

export default function NewAgentPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[240px]">
        <NewAgentContent />
      </main>
    </div>
  )
}
