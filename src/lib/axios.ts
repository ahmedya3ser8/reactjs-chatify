import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) throw new Error('BASE_URL is not defined')

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true
});
