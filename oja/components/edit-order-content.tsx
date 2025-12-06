"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface EditOrderContentProps {
  orderId: string
}

export function EditOrderContent({ orderId }: EditOrderContentProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [billingCustomer, setBillingCustomer] = useState("onboarding-test")
  const [orderName, setOrderName] = useState("test name")
  const [orderDescription, setOrderDescription] = useState("test des")

  const handleNext = () => {
    toast({
      title: "Order updated",
      description: "The order has been updated successfully.",
    })
    router.push("/orders")
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-lg mx-auto pt-16">
        <p className="text-sm text-muted-foreground mb-1">Edit order for</p>
        <h1 className="text-2xl font-semibold mb-8">Onboarding Test Customer</h1>

        <div className="space-y-6">
          {/* Billing Contacts */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Billing Contacts (optional)</label>
            <div className="border border-border rounded-md p-4 space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                No contacts found for Onboarding Test Customer
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create contact
              </Button>
            </div>
          </div>

          {/* Billing Customer */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Billing customer</label>
            <select
              value={billingCustomer}
              onChange={(e) => setBillingCustomer(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="onboarding-test">Onboarding Test Customer</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">Choose a different customer to bill</p>
          </div>

          {/* Order Name */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Order name</label>
            <input
              type="text"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          {/* Order Description */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Order description</label>
            <textarea
              value={orderDescription}
              onChange={(e) => setOrderDescription(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
            />
          </div>

          <Button className="w-full" onClick={handleNext}>
            NEXT: ORDER DETAILS
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
