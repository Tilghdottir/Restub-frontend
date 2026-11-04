import { getSellerEarnings } from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const paymentsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getSellerEarnings:
      builder.query<Awaited<ReturnType<typeof getSellerEarnings>>, {
        from?: string
        to?: string
      } | void>({
        queryFn: (range) => runQuery(() => getSellerEarnings(range ?? {})),
        providesTags: ["SellerEarnings"],
      }),
  }),
})

export const { useGetSellerEarningsQuery } = paymentsApi
