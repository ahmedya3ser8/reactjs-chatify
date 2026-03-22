import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';

import { axiosInstance } from '../lib/axios';
import type { TSignupSchema } from '../pages/SignUpPage';
import type { TLoginSchema } from '../pages/LoginPage';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface IAuthState {
  authUser: IUser | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggedIn: boolean;
  checkAuth: () => Promise<void>;
  signup: (formData: TSignupSchema) => Promise<void>;
  login: (formData: TLoginSchema) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<IAuthState>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggedIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<IUser>('/auth/check');
      set({ authUser: res.data })
    } catch (error) {
      console.log('Error in authCheck:', error);
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', formData);
      set({ authUser: res.data });
      toast.success('Account created successfully!');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggedIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      set({ authUser: res.data });
      toast.success('Logged in successfully!');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }    
    } finally {
      set({ isLoggedIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully!');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Logout failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }    
    }
  }
}));
