import { Sidebar } from "@/components/sidebar"
import { NewCreditBundleContent } from "@/components/new-credit-bundle-content"

export default function NewCreditBundlePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[240px]">
        <NewCreditBundleContent />
      </main>
    </div>
  )
}
