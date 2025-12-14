"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoriteBtn({ productId }) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some((item) => item.id === Number(productId));

  return (
    <button
      className="cursor-pointer"
      onClick={() => toggleFavorite({ productId, isFavorite })}
    >
      <FontAwesomeIcon icon={isFavorite ? starSolid : starRegular} />
    </button>
  );
}
