"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from '@lastprice/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import { useToast } from "@/hooks/use-toast"
import { MoreVertical, Pencil, Plus, Send, Trash2, X } from "lucide-react"

export function PaymentDetailContent() {
  const params = useParams()
  const paymentId = params.id as string
  const { toast } = useToast()

  const [paymentStatus, setPaymentStatus] = useState("Draft")
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [metadataFields, setMetadataFields] = useState<{ key: string; value: string }[]>([])
  const [tempMetadataFields, setTempMetadataFields] = useState<{ key: string; value: string }[]>([])

  const handlePostPayment = () => {
    setPaymentStatus("Posted")
    toast({
      title: "Payment posted successfully",
      description: `Payment ${paymentId} has been posted.`,
    })
  }

  const handleOpenMetadataModal = () => {
    setTempMetadataFields(metadataFields.length > 0 ? [...metadataFields] : [{ key: "", value: "" }])
    setShowMetadataModal(true)
  }

  const handleAddMetadataField = () => {
    setTempMetadataFields([...tempMetadataFields, { key: "", value: "" }])
  }

  const handleRemoveMetadataField = (index: number) => {
    setTempMetadataFields(tempMetadataFields.filter((_, i) => i !== index))
  }

  const handleMetadataChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...tempMetadataFields]
    updated[index][field] = value
    setTempMetadataFields(updated)
  }

  const handleSaveMetadata = () => {
    const validFields = tempMetadataFields.filter((f) => f.key.trim() !== "")
    setMetadataFields(validFields)
    setShowMetadataModal(false)
    toast({
      title: "Metadata updated",
      description: "Payment metadata has been saved.",
    })
  }

  return (
    <div className="flex flex-1">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-muted-foreground">|</span>
            <Link href="/payments" className="text-muted-foreground hover:text-foreground">
              Payments
            </Link>
            <span className="text-muted-foreground">{">"}</span>
            <span className="font-medium">{paymentId}</span>
          </div>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={handlePostPayment}
            disabled={paymentStatus === "Posted"}
          >
            <Send className="h-4 w-4" />
            Post payment
          </Button>
        </div>

        {/* Allocations Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Allocations</h2>
            <Button
              className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white"
              onClick={() => setShowAllocateModal(true)}
            >
              <Plus className="h-4 w-4" />
              Allocate
            </Button>
          </div>

          {/* Empty State */}
          <div className="border border-border rounded-lg min-h-[300px] flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">No allocations yet</h3>
              <p className="text-muted-foreground">
                Allocations will appear here once you've started allocating
                <br />
                payments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sidebar */}
      <div className="w-80 border-l border-border p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Details</h3>
          <button className="p-1 hover:bg-muted rounded">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Payment number</p>
            <span className="text-sm font-semibold">{paymentId}</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Customer</p>
            <Link href="/customers" className="text-sm text-orange-500 hover:underline">
              Onboarding Test Customer
            </Link>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Payment date</p>
            <span className="text-sm">Dec 6, 2025</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <span className="text-sm">Bank transfer</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <span className="text-sm">12,00 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Allocations</p>
            <span className="text-sm">0,00 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <span className="text-sm">12,00 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <span className="text-sm font-medium">{paymentStatus}</span>
          </div>

          {/* METADATA section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">METADATA</span>
              <button
                onClick={handleOpenMetadataModal}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
            {metadataFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No metadata</p>
            ) : (
              <div className="space-y-1">
                {metadataFields.map((item, index) => (
                  <div key={index}>
                    <span className="text-sm font-medium">{item.key}</span>
                    {item.value && <p className="text-sm text-muted-foreground">{item.value}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Allocate Modal */}
      <Dialog open={showAllocateModal} onOpenChange={setShowAllocateModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle>Allocate payment</DialogTitle>
            <button
              onClick={() => setShowAllocateModal(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Invoice</Label>
              <Input placeholder="Select invoice" />
            </div>

            <div className="space-y-2">
              <Label>Amount to allocate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <Input className="pl-7" placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAllocateModal(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">Allocate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metadata Modal */}
      <Dialog open={showMetadataModal} onOpenChange={setShowMetadataModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle>Edit metadata</DialogTitle>
            <button
              onClick={() => setShowMetadataModal(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {tempMetadataFields.map((field, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Key</Label>
                  <Input
                    value={field.key}
                    onChange={(e) => handleMetadataChange(index, "key", e.target.value)}
                    placeholder="Enter key"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={field.value}
                    onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <button
                  onClick={() => handleRemoveMetadataField(index)}
                  className="mt-8 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddMetadataField} className="w-full gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add field
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowMetadataModal(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white" onClick={handleSaveMetadata}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
