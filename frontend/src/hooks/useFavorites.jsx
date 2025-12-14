import useSWR from "swr";
import api from "@/lib/axios";
import { useUser } from "@/components/UserProvider";
import { useToast } from "@/components/ToastProvider";

const fetcher = (url) =>
  api.get(url, { withCredentials: true }).then((res) => res.data);

export function useFavorites() {
  const { user } = useUser();
  const { addToast } = useToast();
  const { data, error, mutate } = useSWR(
    !!user ? "http://localhost:5000/api/favorites" : null,
    fetcher
  );

  async function toggleFavorite({ productId, isFavorite }) {
    try {
      if (isFavorite) {
        const res = await api.delete(
          `http://localhost:5000/api/favorites/${productId}`,
          { withCredentials: true }
        );
        addToast(res.data.message, "info");
      } else {
        const res = await api.post(
          `http://localhost:5000/api/favorites/${productId}`,
          {},
          {
            withCredentials: true,
          }
        );
        addToast(res.data.message, "info");
      }
      mutate();
    } catch (err) {
      !!user ? addToast(err.response?.data?.message || "Błąd", "error") : null;
    }
  }
  return {
    favorites: data?.favorites ?? [],
    isLoading: !data && !error,
    isError: !!error,
    toggleFavorite,
    mutate,
  };
}
