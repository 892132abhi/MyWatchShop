import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://watchflow.duckdns.org/api/",

  headers: {
    "Content-Type": "application/json"
  },
}

);

axiosInstance.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("accounts/token/refresh/")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      const admin = localStorage.getItem("admin");

      const redirectPath = admin ? "/adminlogin" : "/login";

      if (!refreshToken) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("admin");
        window.location.href = redirectPath;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "https://watchflow.duckdns.org/api/accounts/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = res.data.access;
        localStorage.setItem("access", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("admin");
        window.location.href = redirectPath;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;