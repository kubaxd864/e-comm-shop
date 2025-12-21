"use client";
import axios from "axios";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import FilterSideBar from "@/components/FilterSidebar";
import ProductBox from "@/components/ProductBox";

const fetcher = (url) => axios.get(url).then((r) => r.data);

export default function Category() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "";
  const category = searchParams.get("category") ?? "";
  const { data, error, isLoading } = useSWR(
    `http://localhost:5000/api/products?${searchParams}`,
    fetcher
  );
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const currentCategory = data?.currentCategory ?? "";
  const stores = data?.stores ?? [];

  return (
    <main className="flex flex-1 flex-col gap-4 w-full justify-center p-10 bg-white dark:bg-black">
      <h1 className="text-3xl text-center font-bold mb-4">
        Szukasz {name ? name : "w " + currentCategory}
      </h1>
      {category && name ? (
        <h3 className="text-lg text-center mb-8">
          w kategorii {currentCategory}
        </h3>
      ) : null}
      <div className="flex flex-row gap-5 w-full">
        <FilterSideBar categories={categories} stores={stores} />
        {isLoading ? (
          <p className="w-3/4 text-center">Ładowanie...</p>
        ) : error ? (
          <p className="w-3/4 text-center">Błąd pobieranie danych</p>
        ) : products.length == 0 ? (
          <div className="flex flex-col gap-2 w-3/4">
            <p className="w-full text-2xl text-center">
              Niestety nie znaleźliśmy pasujących produktów
            </p>
            <p className="w-full text-sm text-center">
              Zmień lub wyczyść filtry
            </p>
          </div>
        ) : (
          <div
            className="w-3/4 px-5 grid gap-15 mx-auto h-fit"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {products.map((product) => (
              <ProductBox
                key={product.id}
                id={product.id}
                condition={product.item_condition}
                name={product.name}
                price={product.price}
                thumbnail={product.thumbnail}
                address={product.store_address}
                city={product.store_city}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
