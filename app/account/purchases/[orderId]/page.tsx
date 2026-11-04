import PurchaseDetailContent from "./PurchaseDetailContent"

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  return <PurchaseDetailContent orderId={orderId} />
}
