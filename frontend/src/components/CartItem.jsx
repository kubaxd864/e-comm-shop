import Link from "next/link";
import DeleteBtn from "./DeleteFromCart";
import QuantityNumber from "./QuantityNumber";

export default function CartItem({ id, name, price, quantity, thumbnail }) {
  return (
    <div className="bg-zinc-900 py-3 rounded-md flex flex-row items-center gap-8">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={name ?? "product"}
          className="w-40 h-32 object-contain rounded-md bg-white p-2"
        />
      ) : (
        <div className="w-40 h-32 bg-zinc-800 rounded-md" />
      )}
      <Link href={`product/${id}`}>
        <p className="text-lg font-medium max-w-[250px] hover:text-blue-600">
          {name}
        </p>
      </Link>
      <div className="flex flex-row gap-8 items-center ml-auto">
        <QuantityNumber value={quantity} productId={id} />
        <p className="text-xl font-bold">{price} zł</p>
        <DeleteBtn productId={id} />
      </div>
    </div>
  );
}
