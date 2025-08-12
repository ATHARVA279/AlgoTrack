import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "https://algotrack-vujc.onrender.com";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - check if backend is running on", baseURL);
    }
    console.error("Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
