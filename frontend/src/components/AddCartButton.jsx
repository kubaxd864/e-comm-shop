"use client";
import { useCart } from "@/hooks/useCart";

export default function CartBtn({ productId }) {
  const { items, addToCart } = useCart();
  const inCart = items?.some((item) => item.id == Number(productId));
  return (
    <button
      className="bg-blue-800 px-5 py-2.5 rounded-sm cursor-pointer hover:bg-blue-700"
      onClick={() => addToCart(Number(productId))}
    >
      {inCart ? "W koszyku" : "Do koszyka"}
    </button>
  );
}
