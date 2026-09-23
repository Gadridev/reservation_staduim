import axios from "axios";
import { attachAuthInterceptor } from "./interceptors";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(api);

export default api;