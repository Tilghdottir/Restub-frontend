import type { SubmitKycRequest } from "./types"
import { getKycCases, getKycProfile, submitKyc } from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const kycApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getKycCases: builder.query<Awaited<ReturnType<typeof getKycCases>>, void>({
      queryFn: () => runQuery(() => getKycCases()),
      providesTags: ["KycCases"],
    }),
    getKycProfile:
      builder.query<Awaited<ReturnType<typeof getKycProfile>>, void>({
        queryFn: () => runQuery(() => getKycProfile()),
        providesTags: ["KycProfile"],
      }),
    submitKyc: builder.mutation<Awaited<ReturnType<typeof submitKyc>>, {
      payload: SubmitKycRequest
      idempotencyKey?: string
    }>({
      queryFn: ({ payload, idempotencyKey }) =>
        runQuery(() => submitKyc(payload, idempotencyKey)),
      invalidatesTags: ["KycProfile", "KycCases"],
    }),
  }),
})

export const {
  useGetKycCasesQuery,
  useGetKycProfileQuery,
  useSubmitKycMutation,
} = kycApi
