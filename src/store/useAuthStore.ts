import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

import { axiosInstance } from '../lib/axios';
import type { TSignupSchema } from '../pages/SignUpPage';
import type { TLoginSchema } from '../pages/LoginPage';

const BASE_URL = import.meta.env.BASE_URL;

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string;
}

interface IAuthState {
  authUser: IUser | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggedIn: boolean;
  isUpdateProfile: boolean;
  socket: Socket | null;
  onlineUsers: string[],
  checkAuth: () => Promise<void>;
  signup: (formData: TSignupSchema) => Promise<void>;
  login: (formData: TLoginSchema) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<IAuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggedIn: false,
  isUpdateProfile: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<IUser>('/auth/check');
      set({ authUser: res.data });
      get().connectSocket();
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
      get().connectSocket();
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
      get().connectSocket();
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
      get().disconnectSocket();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Logout failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }    
    }
  },

  updateProfile: async (data) => {
    set({ isUpdateProfile: true })
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Update profile. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      } 
    } finally {
      set({ isUpdateProfile: false })
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, { 
      withCredentials: true // this ensures cookies are sent with the connection
    });

    socket.connect();
    set({ socket });

    // listen for online users event
    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds })
    })
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  }
}));
