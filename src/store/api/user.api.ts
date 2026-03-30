import { baseApi } from './base.api';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<any, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    getPurchases: builder.query<any, void>({
      query: () => '/user/purchases',
      providesTags: ['Purchases'],
    }),
    getTransactions: builder.query<any, number>({
      query: (page = 1) => `/user/transactions?page=${page}`,
      providesTags: ['Transactions'],
    }),
    getReferrals: builder.query<any, void>({
      query: () => '/user/referrals',
      providesTags: ['User'],
    }),
    getWithdrawals: builder.query<any, void>({
      query: () => '/user/withdrawals',
      providesTags: ['User'],
    }),
    requestWithdrawal: builder.mutation<any, { amount: number; bankDetails: any }>({
      query: (data) => ({
        url: '/user/withdrawals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserQuery,
  useGetPurchasesQuery,
  useGetTransactionsQuery,
  useGetReferralsQuery,
  useGetWithdrawalsQuery,
  useRequestWithdrawalMutation,
} = userApi;
