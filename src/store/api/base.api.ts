import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://desocialplug.com/api",
    credentials: "include",
    prepareHeaders: async (headers) => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
          headers.set("Cookie", `session_token=${token}`);
        }
      } catch (error) {
        console.error("Failed to get token from AsyncStorage", error);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Transactions", "Purchases", "Categories", "Funds"],
  endpoints: () => ({}),
});
