// src/axiosConfig.js
import axios from "axios";
import BASE_URL from "./api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export default axiosInstance;
