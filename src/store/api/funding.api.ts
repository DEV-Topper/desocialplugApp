import { baseApi } from './base.api';

export const fundingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVirtualAccount: builder.query<any, string>({
      query: (userId) => `/pocketfi/virtual-account?userId=${userId}`,
      providesTags: ['Funds'],
    }),
    createVirtualAccount: builder.mutation<any, { userId: string, bvn: string }>({
      query: (data) => ({
        url: '/pocketfi/virtual-account',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Funds'],
    }),
    createCryptoPayment: builder.mutation<
      any,
      {
        userId: string;
        userName: string;
        userEmail: string;
        amount: number;
        currency?: string;
        callbackUrl: string;
        returnUrl: string;
      }
    >({
      query: (data) => ({
        url: '/payments/heleket-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Funds'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVirtualAccountQuery,
  useCreateVirtualAccountMutation,
  useCreateCryptoPaymentMutation,
} = fundingApi;
