import { SettingsLayout } from "@/components/settings-layout"
import { IntegrationsContent } from "@/components/integrations-content"

export default function IntegrationsPage() {
  return (
    <SettingsLayout
      title="Integrations"
      breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Integrations" }]}
    >
      <IntegrationsContent />
    </SettingsLayout>
  )
}
