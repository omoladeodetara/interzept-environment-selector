import { SettingsLayout } from "@/components/settings-layout"
import { TeamSettingsContent } from "@/components/team-settings-content"
import { WorkspaceProvider } from "@/contexts/workspace-context"

export default function TeamSettingsPage() {
  return (
    <WorkspaceProvider>
      <SettingsLayout>
        <TeamSettingsContent />
      </SettingsLayout>
    </WorkspaceProvider>
  )
}
