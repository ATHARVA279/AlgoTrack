import axios from "axios";
import { requestCache } from "./requestCache";

type ViteEnv = { VITE_API_URL?: string; DEV?: boolean };
const env = ((import.meta as unknown) as { env: ViteEnv }).env || {};
const baseURL = env.VITE_API_URL || (env.DEV ? "http://localhost:5000" : "");

if (!baseURL) {
  // Fail fast in production if API base URL is not configured
  throw new Error("VITE_API_URL is not set. Configure it in your production environment.");
}

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'get') {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);
      if (cached) {
        return Promise.reject({
          __cached: true,
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: error.status,
        statusText: error.statusText,
        headers: error.headers,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
