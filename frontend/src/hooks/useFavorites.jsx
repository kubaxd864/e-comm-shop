import useSWR from "swr";
import axios from "axios";

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

export function useFavorites() {
  const { data, error, mutate } = useSWR(
    "http://localhost:5000/api/favorites",
    fetcher
  );
  return {
    favorites: data?.favorites ?? [],
    isLoading: !data && !error,
    isError: !!error,
    mutate,
  };
}
