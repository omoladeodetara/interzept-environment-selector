import { EditOrderContent } from "@/components/edit-order-content"

export default function EditOrderPage({ params }: { params: { id: string } }) {
  return <EditOrderContent orderId={params.id} />
}
