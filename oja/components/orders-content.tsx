"use client"

import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import Link from "next/link"

export function OrdersContent() {
  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/orders/new">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <div className="border border-border rounded-lg p-16 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold mb-2">No orders available</h3>
        <p className="text-muted-foreground mb-6">Draft and active orders will appear here.</p>
        <Button variant="outline" className="bg-transparent" asChild>
          <Link href="/orders/new">Add order</Link>
        </Button>
      </div>
    </div>
  )
}
