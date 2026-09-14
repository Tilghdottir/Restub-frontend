import { EVENTS } from "../../lib/data"
import EventDetail from "./EventDetail"

export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: String(e.id) }))
}

export const dynamicParams = false

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EventDetail id={id} />
}
