import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string;
}

export interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image: string;
  createdAt: Date;
}

interface IChatState {
  allContacts: IUser[];
  chats: IUser[];
  messages: IMessage[];
  activeTab: 'chats' | 'contacts';
  selectedUser: IUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  setActiveTab: (tab: 'chats' | 'contacts') => void;
  setSelectedUser: (selectedUser: IUser | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (formData: FormData) => Promise<void>;
}

const getInitialSound = (): boolean => {
  try {
    const value = localStorage.getItem('isSoundEnabled');
    return value ? JSON.parse(value) : true;
  } catch {
    return true;
  }
}

export const useChatStore = create<IChatState>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: getInitialSound(),

  toggleSound: () => {
    const newVal = !get().isSoundEnabled;
    localStorage.setItem('isSoundEnabled', JSON.stringify(newVal));
    set({ isSoundEnabled: newVal })
  },

  setActiveTab: (tab) => set({ activeTab: tab }), 
  
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get('/messages/contacts');
      set({ allContacts: res.data });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get('/messages/chats');
      set({ chats: res.data });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getMessagesByUserId: async (userId: string) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (formData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser?._id as string,
      receiverId: selectedUser?._id as string,
      text: formData.get("text") as string,
      image: formData.get("image") as string,
      createdAt: new Date(),
      isOptimistic: true
    }
    set({ messages: [...messages, optimisticMessage] });
    try {
      const res = await axiosInstance.post(`messages/send/${selectedUser?._id}`, formData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      if (isAxiosError(error)) {
        set({ messages: messages });
        toast.error(error.response?.data?.message || 'Failed. Please try again.');
      } else {
        toast.error('Unexpected error occurred');
      }
    }
  }
}));
