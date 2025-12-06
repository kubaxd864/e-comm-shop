"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "./ToastProvider";

export default function FavoriteBtn({ productId }) {
  const { favorites, mutate } = useFavorites();
  const { addToast } = useToast();
  const isFavorite = favorites.some((item) => item.id === Number(productId));

  const toggleFavorite = async () => {
    await mutate(
      async () => {
        if (isFavorite) {
          const res = await axios.delete(
            `http://localhost:5000/api/favorites/${productId}`,
            { withCredentials: true }
          );
          addToast(res.data.message, "info");
        } else {
          const res = await axios.post(
            `http://localhost:5000/api/favorites/${productId}`,
            {},
            {
              withCredentials: true,
            }
          );
          addToast(res.data.message, "info");
        }
        const updated = isFavorite
          ? favorites.filter((item) => item.id !== productId)
          : [...favorites, { id: productId }];
        return { favorites: updated };
      },
      { revalidate: true }
    );
  };

  return (
    <button className="cursor-pointer" onClick={toggleFavorite}>
      <FontAwesomeIcon icon={isFavorite ? starSolid : starRegular} />
    </button>
  );
}
