"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";

export default function FavoriteBtn() {
  return (
    <button
      className="cursor-pointer"
      onClick={() => console.log("Dodano do ulubionych")}
    >
      <FontAwesomeIcon icon={faStar}></FontAwesomeIcon>
    </button>
  );
}
