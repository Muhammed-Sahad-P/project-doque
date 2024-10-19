import axios from "axios";
import Cookies from "js-cookie";

// Create the Axios instance
const AxiosInstance = axios.create({
  baseURL: "https://daily-grid-rest-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

//? request interceptor to attach the token to the Authorization header
AxiosInstance.interceptors.request.use(
  (config) => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user = JSON.parse(userCookie);
      const token = user.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AxiosInstance;
