import Link from "next/link";
import FavoriteBtn from "./FavoriteButton";
import CartBtn from "./AddCartButton";

export default function SimilarProd({ id, name, price, thumbnail }) {
  return (
    <div className="bg-bg-secondary p-3 rounded-md flex flex-col items-center gap-2 relative">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={name ?? "product"}
          className="w-44 h-36 object-contain rounded-md bg-white p-2"
        />
      ) : (
        <div className="w-44 h-36 bg-zinc-800 rounded-md" />
      )}
      <Link href={`${id}`}>
        <p className="text-sm font-medium">{name}</p>
      </Link>
      <div className="flex flex-col gap-2 mt-auto w-full">
        <p className="text-sm text-zinc-400">{price} zł</p>
        <div className="flex flex-row justify-between w-full p-2">
          <FavoriteBtn productId={id} />
          <CartBtn productId={id} />
        </div>
      </div>
    </div>
  );
}
