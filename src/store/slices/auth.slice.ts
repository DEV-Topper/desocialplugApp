import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth.api';

interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  referralCode?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      AsyncStorage.setItem('token', action.payload.token);
      AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        if (payload.success && payload.token) {
          state.token = payload.token;
          state.user = payload.user;
          state.isAuthenticated = true;
          AsyncStorage.setItem('token', payload.token);
          AsyncStorage.setItem('user', JSON.stringify(payload.user));
        }
      }
    );
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, { payload }) => {
        if (payload.success && payload.token) {
          state.token = payload.token;
          state.user = payload.user;
          state.isAuthenticated = true;
          AsyncStorage.setItem('token', payload.token);
          AsyncStorage.setItem('user', JSON.stringify(payload.user));
        }
      }
    );
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
