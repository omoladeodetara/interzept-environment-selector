import { SettingsLayout } from "@/components/settings-layout"
import { TaxSettingsContent } from "@/components/tax-settings-content"

export default function TaxSettingsPage() {
  return (
    <SettingsLayout title="Tax">
      <TaxSettingsContent />
    </SettingsLayout>
  )
}
