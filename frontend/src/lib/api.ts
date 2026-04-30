import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8001").replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("audycook_admin_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customerApi = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("audycook_customer_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const WHATSAPP_NUMBER = "352661299974";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
