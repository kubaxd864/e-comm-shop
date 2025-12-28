import api from "./axios";

export const fetcher = (url) =>
  api.get(url, { withCredentials: true }).then((res) => res.data);
