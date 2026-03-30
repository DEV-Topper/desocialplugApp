import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseApi } from './base.api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            await AsyncStorage.setItem('token', data.token);
          }
        } catch {}
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            await AsyncStorage.setItem('token', data.token);
          }
        } catch {}
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch {}
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      },
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: emailData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useForgotPasswordMutation } = authApi;
