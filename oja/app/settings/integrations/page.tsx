import { SettingsLayout } from "@/components/settings-layout"
import { IntegrationsContent } from "@/components/integrations-content"
import { WorkspaceProvider } from "@/contexts/workspace-context"

export default function IntegrationsPage() {
  return (
    <WorkspaceProvider>
      <SettingsLayout
        title="Integrations"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Integrations" }]}
      >
        <IntegrationsContent />
      </SettingsLayout>
    </WorkspaceProvider>
  )
}
