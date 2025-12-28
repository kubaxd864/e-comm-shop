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
    `http://localhost:5000/api/admin/get_products`,
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
      console.error(err);
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }
  return (
    <div className="flex flex-1 w-full flex-col gap-8 items-center px-6 py-12">
      <div className="flex flex-row w-full md:w-11/12 lg:w-9/12 xl:w-7/12">
        <h1 className="text-3xl font-semibold">Produkty</h1>
        <Link
          href={"/admin_panel/addProduct"}
          className="flex flex-row gap-2 items-center justify-center ml-auto px-4 py-2 rounded bg-primary text-text-secondary cursor-pointer hover:bg-primary-hover"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Dodaj produkt</span>
        </Link>
      </div>
      <div className="flex flex-col p-10 gap-6 w-full md:w-11/12 lg:w-9/12 xl:w-7/12 max-h-[630px] overflow-auto hide-scrollbar bg-bg-secondary rounded-lg">
        {isLoading ? (
          <p className="w-full text-center">Wczytywanie danych....</p>
        ) : error ? (
          <p className="w-full text-center">Błąd wczytywania danych</p>
        ) : (
          products.map((product, idx) => (
            <div
              key={idx}
              className="flex items-center gap-6 p-4 rounded border border-border bg-bg-secondary"
            >
              <img
                src={product.thumbnail}
                alt={product.name ?? "product"}
                className="w-24 h-18 shrink-0 object-contain rounded-md bg-white"
              />
              <p className="flex-1 min-w-0 text-lg max-w-2xl break-words">
                {product.name}
              </p>
              <div className="flex flex-row justify-center items-center gap-5 ml-auto">
                <p className="text-lg font-semibold px-3">{product.price} zł</p>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    product.is_active
                      ? "bg-green-500/10 text-green-500"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {product.is_active ? "Aktywny" : "Ukryty"}
                </span>
                <div className="flex">
                  <button
                    onClick={() =>
                      router.push(`/admin_panel/updateProduct?id=${product.id}`)
                    }
                    className="px-3 py-1 text-sm cursor-pointer text-text-secondary"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    onClick={() => DeleteProduct(product.id)}
                    className="px-3 py-1 text-sm cursor-pointer text-text-secondary"
                  >
                    <FontAwesomeIcon
                      icon={product.is_active ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
