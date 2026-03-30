import { baseApi } from './base.api';

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<any, void>({
      query: () => '/accounts',
      providesTags: ['Categories'],
    }),
    getCategories: builder.query<any, void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    purchaseAccount: builder.mutation<any, { accountId: string; quantity: number }>({
      query: (data) => ({
        url: '/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Purchases', 'User', 'Categories'], // Updates balance, purchases, stock
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAccountsQuery,
  useGetCategoriesQuery,
  usePurchaseAccountMutation,
} = accountsApi;
