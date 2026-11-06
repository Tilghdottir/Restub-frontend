import { formatNaira } from "../../../../lib/money"
import type { TransactionSummary } from "../../../../lib/account-data/types"

function formatAmount(transaction: TransactionSummary): string {
  return transaction.currency === "NGN"
    ? formatNaira(transaction.amount)
    : `${transaction.currency} ${transaction.amount.toLocaleString()}`
}

export default function TransactionList({
  transactions,
}: {
  transactions: TransactionSummary[]
}) {
  return (
    <div className="divide-y divide-[#E8E9EB]">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-[14px] font-medium text-[#111111]">
              {transaction.status === "refunded" ? "Refund" : "Payment"} for
              order {transaction.orderId}
            </p>
            <p className="mt-1 text-[12px] text-[#292B2F]">
              {transaction.provider} ·{" "}
              {new Date(transaction.createdAt).toLocaleString("en-NG")} ·{" "}
              {transaction.providerReference ?? transaction.id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-data font-semibold text-[#111111]">
              {formatAmount(transaction)}
            </span>
            <span className="rounded-full bg-[#E8E9EB] px-2 py-1 text-[11px] capitalize text-[#111111]">
              {transaction.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
