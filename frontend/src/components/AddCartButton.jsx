"use client";
import { useCart } from "@/hooks/useCart";

export default function CartBtn({ productId }) {
  const { items, addToCart } = useCart();
  const inCart = items?.some((item) => item.id == Number(productId));
  return (
    <button
      className="bg-primary px-5 py-2.5 rounded-sm cursor-pointer text-text-secondary hover:bg-primary-hover"
      onClick={() => addToCart(Number(productId))}
    >
      {inCart ? "W koszyku" : "Do koszyka"}
    </button>
  );
}
