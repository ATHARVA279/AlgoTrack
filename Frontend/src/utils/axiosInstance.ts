import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://algotrack-vujc.onrender.com",
  withCredentials: true,
});

export default axiosInstance;
