"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/hooks/useCart";

export default function DeleteBtn({ productId }) {
  const { deleteFromCart } = useCart();
  return (
    <button
      className="w-8 cursor-pointer"
      onClick={() => deleteFromCart(productId)}
    >
      <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
    </button>
  );
}
