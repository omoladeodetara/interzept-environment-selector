import { SettingsLayout } from "@/components/settings-layout"
import { SalesPlaybookContent } from "@/components/sales-playbook-content"

export default function SalesPlaybookPage() {
  return (
    <SettingsLayout title="Sales playbook">
      <SalesPlaybookContent />
    </SettingsLayout>
  )
}
