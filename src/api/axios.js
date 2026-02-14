import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "https://camous-app-backend.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // VERY IMPORTANT FOR COOKIES
});

export default api;
