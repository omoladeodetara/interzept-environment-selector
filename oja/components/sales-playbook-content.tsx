"use client"

import { useState } from "react"
import { Button } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Textarea } from '@lastprice/ui'
import { Pencil, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PlaybookData {
  // ICP
  industry: string
  companySize: string
  geography: string
  painPoint1: string
  painPoint2: string
  // Value Props
  primaryValueProp: string
  roiPromise: string
  // Pricing Strategy
  pricingModel: string
  listPrice: string
  standardDiscount: string
  maximumDiscount: string
  volumeDiscounts: string
  annualCommitment: string
  // Commercial Terms
  paymentTerms: string
  minimumCommitment: string
}

const defaultData: PlaybookData = {
  industry: "[Target industries]",
  companySize: "[Employee count/revenue range]",
  geography: "[Target regions/markets]",
  painPoint1: "[Primary pain point with quantifiable impact]",
  painPoint2: "[Secondary pain point with business consequence]",
  primaryValueProp: "We help [ICP] achieve [outcome] by [unique approach]",
  roiPromise: "[Specific % improvement/savings/efficiency gain]",
  pricingModel: "[Per seat/usage-based/flat fee/% of savings]",
  listPrice: "[Standard pricing tiers]",
  standardDiscount: "[X]% (no approval needed)",
  maximumDiscount: "[Y]% (requires [approval level])",
  volumeDiscounts: "[Tiers and thresholds]",
  annualCommitment: "[Discount for longer terms]",
  paymentTerms: "[Net 30/Annual prepay/Monthly]",
  minimumCommitment: "[Contract length, usage minimums]",
}

export function SalesPlaybookContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState<PlaybookData>(defaultData)
  const [editData, setEditData] = useState<PlaybookData>(defaultData)
  const { toast } = useToast()

  const handleEdit = () => {
    setEditData(data)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(data)
    setIsEditing(false)
  }

  const handleSave = () => {
    setData(editData)
    setIsEditing(false)
    toast({
      title: "Success",
      description: "Sales playbook saved successfully",
    })
  }

  const handleLoadTemplate = () => {
    setData(defaultData)
    setEditData(defaultData)
    toast({
      title: "Template loaded",
      description: "Default template has been applied",
    })
  }

  const updateField = (field: keyof PlaybookData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-sm text-muted-foreground">
        Define your sales methodology, ICP profiles, pricing guardrails, and competitive positioning. This context
        directly informs agent pricing calculations, discount policies, value-based pricing models, and ROI
        justifications for prospects.
      </p>

      {/* Playbook Card */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Zyleme Sales Playbook</h2>
          <Button variant="outline" size="sm" onClick={handleLoadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>

        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-8">
            {/* ICP Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Ideal Customer Profile (ICP)</h3>

              <div className="mb-4">
                <p className="font-medium mb-2">Primary Segments:</p>
                <div className="space-y-3 ml-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Industry:</label>
                    <Input
                      value={editData.industry}
                      onChange={(e) => updateField("industry", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Company Size:</label>
                    <Input
                      value={editData.companySize}
                      onChange={(e) => updateField("companySize", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Geography:</label>
                    <Input
                      value={editData.geography}
                      onChange={(e) => updateField("geography", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Pain Points We Solve:</p>
                <div className="space-y-3 ml-4">
                  <Input
                    value={editData.painPoint1}
                    onChange={(e) => updateField("painPoint1", e.target.value)}
                    placeholder="Primary pain point"
                  />
                  <Input
                    value={editData.painPoint2}
                    onChange={(e) => updateField("painPoint2", e.target.value)}
                    placeholder="Secondary pain point"
                  />
                </div>
              </div>
            </div>

            {/* Value Props Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Value Propositions & ROI Drivers</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Primary Value Prop:</label>
                  <Textarea
                    value={editData.primaryValueProp}
                    onChange={(e) => updateField("primaryValueProp", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">ROI Promise:</label>
                  <Input
                    value={editData.roiPromise}
                    onChange={(e) => updateField("roiPromise", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Strategy Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing Strategy & Guardrails</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Pricing Model:</label>
                    <Input
                      value={editData.pricingModel}
                      onChange={(e) => updateField("pricingModel", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">List Price:</label>
                    <Input
                      value={editData.listPrice}
                      onChange={(e) => updateField("listPrice", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Discount Policy:</p>
                  <div className="space-y-3 ml-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Standard Discount:</label>
                      <Input
                        value={editData.standardDiscount}
                        onChange={(e) => updateField("standardDiscount", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Maximum Discount:</label>
                      <Input
                        value={editData.maximumDiscount}
                        onChange={(e) => updateField("maximumDiscount", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Volume Discounts:</label>
                      <Input
                        value={editData.volumeDiscounts}
                        onChange={(e) => updateField("volumeDiscounts", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Annual Commitment:</label>
                      <Input
                        value={editData.annualCommitment}
                        onChange={(e) => updateField("annualCommitment", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Terms Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Commercial Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Payment Terms:</label>
                  <Input
                    value={editData.paymentTerms}
                    onChange={(e) => updateField("paymentTerms", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Minimum Commitment:</label>
                  <Input
                    value={editData.minimumCommitment}
                    onChange={(e) => updateField("minimumCommitment", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">
                Save
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* ICP Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Ideal Customer Profile (ICP)</h3>

              <div className="mb-3">
                <p className="font-medium">Primary Segments:</p>
                <ul className="list-disc list-inside ml-2 text-sm text-muted-foreground space-y-1">
                  <li>
                    Industry: <span className="text-foreground">{data.industry}</span>
                  </li>
                  <li>
                    Company Size: <span className="text-foreground">{data.companySize}</span>
                  </li>
                  <li>
                    Geography: <span className="text-foreground">{data.geography}</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium">Pain Points We Solve:</p>
                <ul className="list-disc list-inside ml-2 text-sm text-muted-foreground space-y-1">
                  <li>
                    <span className="text-foreground">{data.painPoint1}</span>
                  </li>
                  <li>
                    <span className="text-foreground">{data.painPoint2}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Value Props Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Value Propositions & ROI Drivers</h3>
              <p className="text-sm">
                <span className="font-medium">Primary Value Prop:</span> {data.primaryValueProp}{" "}
                <span className="font-medium">ROI Promise:</span> {data.roiPromise}
              </p>
            </div>

            {/* Pricing Strategy Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pricing Strategy & Guardrails</h3>
              <p className="text-sm mb-2">
                <span className="font-medium">Pricing Model:</span> {data.pricingModel}{" "}
                <span className="font-medium">List Price:</span> {data.listPrice}
              </p>
              <div>
                <p className="font-medium text-sm">Discount Policy:</p>
                <ul className="list-disc list-inside ml-2 text-sm text-muted-foreground space-y-1">
                  <li>
                    Standard Discount: <span className="text-foreground">{data.standardDiscount}</span>
                  </li>
                  <li>
                    Maximum Discount: <span className="text-foreground">{data.maximumDiscount}</span>
                  </li>
                  <li>
                    Volume Discounts: <span className="text-foreground">{data.volumeDiscounts}</span>
                  </li>
                  <li>
                    Annual Commitment: <span className="text-foreground">{data.annualCommitment}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Commercial Terms Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Commercial Terms</h3>
              <p className="text-sm">
                <span className="font-medium">Payment Terms:</span> {data.paymentTerms}{" "}
                <span className="font-medium">Minimum Commitment:</span> {data.minimumCommitment}
              </p>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-4">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
