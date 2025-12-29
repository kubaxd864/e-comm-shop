import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function LatestProducts({ products }) {
  return (
    <div className="flex flex-col bg-bg-secondary rounded-xl h-fit">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Latest products</h2>
      </div>
      <ul className="flex flex-col">
        {products.slice(0, 5).map((product) => (
          <li
            key={product.id}
            className="flex items-center gap-4 px-6 py-4 border-b"
          >
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-10 h-10 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-neutral-400">
                {product.created_at.split("T")[0]}
              </p>
            </div>
            <button className="">
              <FontAwesomeIcon icon={faEllipsisVertical}></FontAwesomeIcon>
            </button>
          </li>
        ))}
      </ul>
      <div className="px-6 py-4 text-right">
        <Link
          href={"admin_panel/products"}
          className="text-sm font-medium text-primary cursor-pointer hover:underline"
        >
          View all →
        </Link>
      </div>
    </div>
  );
}
