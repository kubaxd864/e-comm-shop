import axios from "axios";

const api = axios.create({
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      window.location.href = "/404";
    }
    if (error.response?.status === 404) {
      window.location.href = "/404";
    }
    return Promise.reject(error);
  }
);

export default api;
