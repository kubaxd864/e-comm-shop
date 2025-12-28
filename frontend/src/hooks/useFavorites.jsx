import useSWR from "swr";
import api from "@/lib/axios";
import { useUser } from "./useUser";
import { useToast } from "@/components/ToastProvider";
import { fetcher } from "@/lib/fetcher";

export function useFavorites() {
  const { user } = useUser();
  const { addToast } = useToast();
  const { data, error, isLoading, mutate } = useSWR(
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
    isLoading: isLoading,
    isError: !!error,
    toggleFavorite,
    mutate,
  };
}
