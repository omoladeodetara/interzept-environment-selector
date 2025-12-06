import { SettingsLayout } from "@/components/settings-layout"
import { CompanySettingsContent } from "@/components/company-settings-content"

export default function CompanySettingsPage() {
  return (
    <SettingsLayout title="Company">
      <CompanySettingsContent />
    </SettingsLayout>
  )
}
