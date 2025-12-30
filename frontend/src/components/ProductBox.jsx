import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCamera } from "@fortawesome/free-regular-svg-icons";
import FavoriteBtn from "./FavoriteButton";
import CartBtn from "./AddCartButton";

export default function ProductBox({
  id,
  category_id,
  condition,
  name,
  promotion_price,
  price,
  thumbnail,
  address,
  city,
}) {
  return (
    <div className="relative flex flex-col gap-2 bg-bg-secondary shadow-sm rounded-sm p-2 h-full">
      <div className="relative w-full aspect-3/2 overflow-hidden rounded-lg bg-white">
        {!thumbnail == "" ? (
          <Image
            src={thumbnail}
            alt="Miniatura"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-scale-down"
          />
        ) : (
          <div className="flex w-full h-full justify-center items-center">
            <FontAwesomeIcon
              icon={faCamera}
              className="text-gray-800 h-8! w-8!"
            ></FontAwesomeIcon>
          </div>
        )}
      </div>
      <div className="flex flex-col p-3 gap-3.5 flex-1">
        <Link
          href={`/product/${id}`}
          className="flex text-xl hover:text-primary-hover"
        >
          <p className="text-left">{name}</p>
        </Link>
        <div className="flex flex-col text-left">
          <p className="text-sm">Lokalizacja:</p>
          <p className="text-sm font-bold">
            {address}, {city}
          </p>
        </div>
        <div className="flex flex-col text-left">
          <p className="text-sm">Stan:</p>
          <p className="text-sm font-bold">{condition}</p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          {category_id == "16" && promotion_price != null ? (
            <p className="flex flex-col">
              <span className="text-lg text-right text-gray-500 line-through">
                {price} zł
              </span>
              <span className="text-2xl text-right">{promotion_price} zł</span>
            </p>
          ) : (
            <p className="text-2xl text-right">{price} zł</p>
          )}
          <div className="flex flex-row justify-between">
            <FavoriteBtn productId={id} />
            <CartBtn productId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
