import { getCurrentUser, login, logout, register } from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const authApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser:
      builder.query<Awaited<ReturnType<typeof getCurrentUser>>, void>({
        queryFn: () => runQuery(() => getCurrentUser()),
        providesTags: ["AuthUser"],
      }),
    login: builder.mutation<void, {
      email: string
      password: string
    }>({
      queryFn: ({ email, password }) => runQuery(() => login(email, password)),
      invalidatesTags: [
        "AuthUser",
        "AccountSummary",
        "Order",
        "Listings",
        "KycProfile",
        "KycCases",
        "PayoutAccounts",
        "Tickets",
        "PaymentMethods",
        "Transactions",
        "Notifications",
        "Refunds",
      ],
    }),
    register: builder.mutation<void, {
      email: string
      password: string
      profile?: Parameters<typeof register>[2]
    }>({
      queryFn: ({ email, password, profile }) =>
        runQuery(() => register(email, password, profile)),
    }),
    logout: builder.mutation<void, void>({
      queryFn: () => runQuery(() => logout()),
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        void queryFulfilled.then(
          () => dispatch(rtkApi.util.resetApiState()),
          () => undefined,
        )
      },
    }),
  }),
})

export const {
  useGetCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi
