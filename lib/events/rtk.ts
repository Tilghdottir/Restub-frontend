import { rtkApi, runQuery } from "../rtk-api"
import {
  approvePendingEvent,
  getAdminCatalogEvents,
  getPendingEvents,
  getEventPartners,
  getEvents,
  searchEventPartners,
} from "./client"

const eventsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCatalogEvents:
      builder.query<Awaited<ReturnType<typeof getAdminCatalogEvents>>, void>({
        queryFn: () => runQuery(() => getAdminCatalogEvents()),
        providesTags: ["Events"],
      }),
    getPendingEvents:
      builder.query<Awaited<ReturnType<typeof getPendingEvents>>, {
        limit?: number
        cursor?: string
      } | void>({
        queryFn: (options) => runQuery(() => getPendingEvents(options ?? {})),
        providesTags: ["Events"],
      }),
    approvePendingEvent: builder.mutation<void, string>({
      queryFn: (id) => runQuery(() => approvePendingEvent(id)),
      invalidatesTags: ["Events"],
    }),
    getEventPartners:
      builder.query<Awaited<ReturnType<typeof getEventPartners>>, void>({
        queryFn: () => runQuery(() => getEventPartners()),
        providesTags: ["Partners"],
      }),
    searchEventPartners:
      builder.query<Awaited<ReturnType<typeof searchEventPartners>>, string>({
        queryFn: (query) => runQuery(() => searchEventPartners(query)),
      }),
    getEvents: builder.query<Awaited<ReturnType<typeof getEvents>>, {
      slug: string
    }>({
      queryFn: ({ slug }) => runQuery(() => getEvents(slug)),
      providesTags: ["Events"],
    }),
  }),
})

export const {
  useGetAdminCatalogEventsQuery,
  useGetPendingEventsQuery,
  useApprovePendingEventMutation,
  useGetEventPartnersQuery,
  useGetEventsQuery,
  useLazySearchEventPartnersQuery,
} = eventsApi
