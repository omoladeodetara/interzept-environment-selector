"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, AlertTriangle } from "lucide-react"
import { TestModeBanner } from "@/components/test-mode-banner"
import { useWorkspace } from "@/contexts/workspace-context"

export function BillingSettingsContent() {
  const [autoSendEmails, setAutoSendEmails] = useState(false)
  const [showDisputeLink, setShowDisputeLink] = useState(false)
  const [invoicePrefix, setInvoicePrefix] = useState("INV")
  const [firstInvoiceNumber, setFirstInvoiceNumber] = useState("1")
  const [bankDetails, setBankDetails] = useState("")
  const { isSandbox } = useWorkspace()

  const invoicePreview = `${invoicePrefix}-${firstInvoiceNumber.padStart(4, "0")}`

  return (
    <div className="flex flex-col h-full">
      <TestModeBanner />

      <div className="space-y-8 p-6 pb-8">
        {/* Connections */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Connections</h2>
          <div className="border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your existing Stripe account to enable immediate payment processing on our platform.
            </p>
            <Button className="bg-[#635BFF] hover:bg-[#5851DB] text-white">
              Connect with <span className="font-bold ml-1">stripe</span>
            </Button>
            {isSandbox && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Payment processing is disabled in test mode. Switch to live mode to connect Stripe.</span>
              </div>
            )}
          </div>
        </section>

        {/* Automation */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Automation</h2>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-send billing emails</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically send emails to billing contacts when invoices are posted.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={autoSendEmails} onCheckedChange={setAutoSendEmails} />
                <span className="text-sm text-muted-foreground">{autoSendEmails ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dispute links */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Dispute links</h2>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show dispute link on invoices</h3>
                <p className="text-sm text-muted-foreground">
                  Display a link on invoices that allows customers to initiate disputes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showDisputeLink} onCheckedChange={setShowDisputeLink} />
                <span className="text-sm text-muted-foreground">{showDisputeLink ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Invoice numbering */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Invoice numbering</h2>
          <div className="border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm text-blue-600 font-medium">Invoice prefix</label>
              <Input
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="mt-1 max-w-xs"
              />
            </div>
            <div>
              <label className="text-sm text-blue-600 font-medium">First invoice number</label>
              <Input
                value={firstInvoiceNumber}
                onChange={(e) => setFirstInvoiceNumber(e.target.value)}
                className="mt-1 max-w-xs"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Preview</label>
              <div className="mt-1">
                <span className="inline-block bg-zinc-900 text-white text-sm px-3 py-1 rounded">{invoicePreview}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bank details */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Bank details</h2>
          <div className="border rounded-lg p-6">
            <label className="text-sm text-blue-600 font-medium">Bank details / payment instructions</label>
            <Textarea
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="Enter your bank details or payment instructions to appear on invoices."
              className="mt-2 min-h-[150px] resize-y"
            />
            <p className="text-sm text-muted-foreground mt-2">This information will be shown on your invoices.</p>
          </div>
        </section>

        {/* Branding */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Branding</h2>
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-blue-600 font-medium">Company logo</span>
              <span className="text-muted-foreground text-xs">○</span>
            </div>
            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">Save</Button>
        </div>
      </div>
    </div>
  )
}
