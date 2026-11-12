import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  if (axios.isAxiosError(error) && error.code === "ERR_NETWORK") {
    return `Cannot reach the API at ${api.defaults.baseURL}. Start the backend and check its MongoDB configuration.`;
  }
  if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
    return "The API request timed out. Check that the backend and database are running, then try again.";
  }
  return error.response?.data?.error?.message ?? error.message ?? "Something went wrong";
}

export default api;
