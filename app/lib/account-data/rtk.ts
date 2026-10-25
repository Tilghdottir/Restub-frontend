import { getNotifications, getPayments, getRefunds, getTickets } from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const accountDataApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Awaited<ReturnType<typeof getTickets>>, void>({
      queryFn: () => runQuery(() => getTickets()),
      providesTags: ["Tickets"],
    }),
    getPayments: builder.query<Awaited<ReturnType<typeof getPayments>>, void>({
      queryFn: () => runQuery(() => getPayments()),
      providesTags: ["PaymentMethods", "Transactions"],
    }),
    getNotifications:
      builder.query<Awaited<ReturnType<typeof getNotifications>>, void>({
        queryFn: () => runQuery(() => getNotifications()),
        providesTags: ["Notifications"],
      }),
    getRefunds: builder.query<Awaited<ReturnType<typeof getRefunds>>, void>({
      queryFn: () => runQuery(() => getRefunds()),
      providesTags: ["Refunds"],
    }),
  }),
})

export const {
  useGetTicketsQuery,
  useGetPaymentsQuery,
  useGetNotificationsQuery,
  useGetRefundsQuery,
} = accountDataApi
