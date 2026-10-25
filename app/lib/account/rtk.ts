import { getAccountSummary } from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const accountApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountSummary:
      builder.query<Awaited<ReturnType<typeof getAccountSummary>>, void>({
        queryFn: () => runQuery(() => getAccountSummary()),
        providesTags: ["AccountSummary"],
      }),
  }),
})

export const { useGetAccountSummaryQuery } = accountApi
