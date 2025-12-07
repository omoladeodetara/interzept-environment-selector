"use client"

import { Button } from '@lastprice/ui'
import { Download, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useFetchData } from '@/hooks/useFetchData'
import { MOCK_ORDERS } from '@/lib/mock-data'

export function OrdersContent() {
  const { data: orders, loading, error } = useFetchData(
    '/api/orders',
    MOCK_ORDERS,
    { params: { tenantId: 'default' } }
  )

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center text-red-500 py-8">
          Error loading orders: {error}
        </div>
      </div>
    )
  }

  const hasOrders = orders && orders.length > 0

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

      {hasOrders ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Order ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/orders/${order.id}`} className="text-blue-500 hover:underline">
                      {order.external_id || order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{order.customer_name || order.customer_id}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{order.total_amount} {order.currency}</td>
                  <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-16 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-2">No orders available</h3>
          <p className="text-muted-foreground mb-6">Draft and active orders will appear here.</p>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/orders/new">Add order</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
