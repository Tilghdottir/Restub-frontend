import { rtkApi, runQuery } from "../rtk-api"
import {
  assignDispute,
  escalateDispute,
  getDisputeDetail,
  getDisputeEvidence,
  getDisputes,
  resolveDispute,
} from "./client"
import type { DisputeOutcome, DisputeStatus } from "./types"

const disputesApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getDisputes: builder.query<Awaited<ReturnType<typeof getDisputes>>, {
      limit?: number
      cursor?: string
      status?: DisputeStatus
    } | void>({
      queryFn: (options) => runQuery(() => getDisputes(options ?? {})),
      providesTags: ["Disputes"],
    }),
    getDisputeDetail:
      builder.query<Awaited<ReturnType<typeof getDisputeDetail>>, string>({
        queryFn: (id) => runQuery(() => getDisputeDetail(id)),
        providesTags: ["Disputes"],
      }),
    getDisputeEvidence:
      builder.query<Awaited<ReturnType<typeof getDisputeEvidence>>, string>({
        queryFn: (id) => runQuery(() => getDisputeEvidence(id)),
        providesTags: ["Disputes"],
      }),
    assignDispute: builder.mutation<void, {
      id: string
      assignedToUserId: string
    }>({
      queryFn: ({ id, assignedToUserId }) =>
        runQuery(() => assignDispute(id, assignedToUserId)),
      invalidatesTags: ["Disputes"],
    }),
    escalateDispute: builder.mutation<
      void,
      {
        id: string
        reason: string
      }
    >({
      queryFn: ({ id, reason }) => runQuery(() => escalateDispute(id, reason)),
      invalidatesTags: ["Disputes"],
    }),
    resolveDispute: builder.mutation<void, {
      id: string
      outcome: DisputeOutcome
      note: string
    }>({
      queryFn: ({ id, outcome, note }) =>
        runQuery(() => resolveDispute(id, outcome, note)),
      invalidatesTags: ["Disputes"],
    }),
  }),
})

export const {
  useGetDisputesQuery,
  useGetDisputeDetailQuery,
  useGetDisputeEvidenceQuery,
  useAssignDisputeMutation,
  useEscalateDisputeMutation,
  useResolveDisputeMutation,
} = disputesApi
