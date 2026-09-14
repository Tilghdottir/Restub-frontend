import PurchaseDetailContent from "./PurchaseDetailContent"

export function generateStaticParams() {
  return [{ orderId: "RC-8921" }, { orderId: "RC-6944" }]
}

export const dynamicParams = false

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  return <PurchaseDetailContent orderId={orderId} />
}
