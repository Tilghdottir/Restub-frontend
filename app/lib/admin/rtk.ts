import { rtkApi, runQuery } from "../rtk-api"
import { getFinancialReport, getPlatformSummary } from "./client"

const adminApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSummary:
      builder.query<Awaited<ReturnType<typeof getPlatformSummary>>, void>({
        queryFn: () => runQuery(() => getPlatformSummary()),
        providesTags: ["AdminSummary"],
      }),
    getFinancialReport:
      builder.query<Awaited<ReturnType<typeof getFinancialReport>>, {
        from?: string
        to?: string
      } | void>({
        queryFn: (range) => runQuery(() => getFinancialReport(range ?? {})),
        providesTags: ["FinancialReport"],
      }),
  }),
})

export const { useGetPlatformSummaryQuery, useGetFinancialReportQuery } =
  adminApi
