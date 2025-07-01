import axios, { CanceledError } from "axios";

// Create Axios instance with baseURL from env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_STOCK_API_BASE_URL,
});

// Attach token dynamically before each request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("x-auth-token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

export default apiClient;
export { CanceledError };
