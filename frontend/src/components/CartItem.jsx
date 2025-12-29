import Link from "next/link";
import DeleteBtn from "./DeleteFromCart";
import QuantityNumber from "./QuantityNumber";

export default function CartItem({ id, name, price, quantity, thumbnail }) {
  return (
    <div className="bg-bg-secondary py-3 rounded-md flex flex-col lg:flex-row items-center gap-8">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={name ?? "product"}
          className="w-40 h-32 object-contain rounded-md bg-white p-2"
        />
      ) : (
        <div className="w-40 h-32 bg-bg-accent rounded-md" />
      )}
      <Link href={`product/${id}`}>
        <p className="text-lg font-medium text-center lg:text-left max-w-[250px] hover:text-primary-hover">
          {name}
        </p>
      </Link>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <QuantityNumber value={quantity} productId={id} />
        <div className="flex flex-row gap-8 items-center">
          <p className="text-xl font-bold">{price} zł</p>
          <DeleteBtn productId={id} />
        </div>
      </div>
    </div>
  );
}
