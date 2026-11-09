import { getCurrentUser, login, logout, register } from "./client"
import { rtkApi, runQuery, runVoidMutation } from "../rtk-api"

const authApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser:
      builder.query<Awaited<ReturnType<typeof getCurrentUser>>, void>({
        queryFn: () => runQuery(() => getCurrentUser()),
        providesTags: ["AuthUser"],
      }),
    login: builder.mutation<null, {
      email: string
      password: string
    }>({
      queryFn: ({ email, password }) =>
        runVoidMutation(() => login(email, password)),
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
    register: builder.mutation<null, {
      email: string
      password: string
      profile?: Parameters<typeof register>[2]
    }>({
      queryFn: ({ email, password, profile }) =>
        runVoidMutation(() => register(email, password, profile)),
    }),
    logout: builder.mutation<null, void>({
      queryFn: () => runVoidMutation(() => logout()),
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
