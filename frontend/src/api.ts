import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({ baseURL: "/api" });

// queue to hold pending requests while refreshing
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalReq = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      err.response?.status === 401 &&
      !originalReq._retry &&
      originalReq.url !== "/auth/login/" &&
      originalReq.url !== "/auth/refresh/"
    ) {
      if (isRefreshing) {
        // queue up
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalReq.headers!["Authorization"] = `Bearer ${token}`;
          return api(originalReq);
        });
      }

      originalReq._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh");
      try {
        const { data } = await axios.post("/api/auth/refresh/", {
          refresh: refreshToken,
        });
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
        processQueue(null, data.access);
        return api(originalReq);
      } catch (e) {
        processQueue(e, null);
        // forced logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
