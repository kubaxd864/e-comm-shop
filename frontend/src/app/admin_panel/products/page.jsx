"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
  faPlus,
  faEye,
  faEyeSlash,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import axios from "axios";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/fetcher";

export default function Products() {
  const { addToast } = useToast();
  const router = useRouter();

  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:5000/api/admin/get_products",
    fetcher
  );

  const products = data?.products ?? [];

  async function DeleteProduct(id) {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/delete_product/${id}`,
        {},
        { withCredentials: true }
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="flex gap-3 w-full lg:w-11/12 xl:w-9/12 2xl:w-6/12 items-center">
        <h1 className="text-3xl font-semibold">Produkty</h1>
        <Link
          href="/admin_panel/addProduct"
          className="ml-auto flex items-center gap-2 text-sm md:text-base rounded bg-primary px-4 py-2 text-text-secondary hover:bg-primary-hover"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Dodaj produkt</span>
        </Link>
      </div>
      <div className="flex w-full lg:w-11/12 xl:w-9/12 2xl:w-6/12 flex-col gap-4 rounded-lg bg-bg-secondary p-6 max-h-[85vh] overflow-auto hide-scrollbar">
        {isLoading ? (
          <p className="text-center">Wczytywanie danych…</p>
        ) : error ? (
          <p className="text-center">Błąd wczytywania danych</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-1 md:grid-cols-[96px_1fr_auto_auto] gap-4 items-center rounded border border-border bg-bg-secondary p-4"
            >
              <img
                src={product.thumbnail}
                alt={product.name ?? "product"}
                className="h-20 w-24 object-contain rounded bg-white mx-auto md:mx-0"
              />
              <p className="truncate text-sm md:text-base font-medium">
                {product.name}
              </p>
              <div className="flex md:flex-col items-center md:items-end gap-2">
                <span className="font-semibold">{product.price} zł</span>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    product.is_active
                      ? "bg-green-500/10 text-green-500"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {product.is_active ? "Aktywny" : "Ukryty"}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() =>
                    router.push(`/admin_panel/updateProduct?id=${product.id}`)
                  }
                  className="p-2 hover:text-primary"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  onClick={() => DeleteProduct(product.id)}
                  className="p-2 hover:text-primary"
                >
                  <FontAwesomeIcon
                    icon={product.is_active ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
