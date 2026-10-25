import { getApiErrorMessage } from "../lib/rtk-api"

export default function ApiErrorNotice({
  error,
  fallback,
}: {
  error: unknown
  fallback: string
}) {
  if (!error) return null

  return (
    <p
      role="alert"
      className="mb-4 rounded-lg border bg-white px-4 py-3 text-[13px]"
      style={{ borderColor: "#E8E9EB", color: "#292B2F" }}
    >
      {getApiErrorMessage(error, fallback)}
    </p>
  )
}
