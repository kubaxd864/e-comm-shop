"use client";
import axios from "axios";
import useSWRInfinite from "swr/infinite";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import FilterSideBar from "@/components/FilterSidebar";
import ProductBox from "@/components/ProductBox";

const fetcher = (url) => axios.get(url).then((r) => r.data);
const PAGE_SIZE = 20;

export default function Category() {
  const searchParams = useSearchParams();
  const paramsString = useMemo(() => searchParams.toString(), [searchParams]);
  const name = searchParams.get("name") ?? "";
  const category = searchParams.get("category") ?? "";

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.products?.length) return null;

    const params = new URLSearchParams(paramsString);
    params.set("page", String(pageIndex + 1));
    params.set("limit", String(PAGE_SIZE));
    return `http://localhost:5000/api/products?${params.toString()}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  );

  const products = data ? data.flatMap((page) => page.products ?? []) : [];
  const firstPage = data?.[0];
  const categories = firstPage?.categories ?? [];
  const currentCategory = firstPage?.currentCategory ?? "";
  const stores = firstPage?.stores ?? [];
  const isReachingEnd =
    data && data[data.length - 1]?.products?.length < PAGE_SIZE;
  const isLoadingMore = isValidating && !isReachingEnd;
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !isValidating &&
      !isReachingEnd
    ) {
      setSize(size + 1);
    }
  }, [isValidating, isReachingEnd, setSize, size]);

  useEffect(() => {
    setSize(1);
  }, [paramsString, setSize]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <main className="flex flex-1 flex-col gap-6 w-full justify-center p-10">
      <h1 className="text-3xl text-center font-bold">
        Szukasz {name ? name : "w " + currentCategory}
      </h1>
      {category && name ? (
        <h3 className="text-lg text-center mb-8">
          w kategorii {currentCategory}
        </h3>
      ) : null}
      <div className="flex flex-row gap-5 w-full">
        <FilterSideBar categories={categories} stores={stores} />
        {!data && isValidating ? (
          <p className="w-3/4 text-center">Wczytywanie produktów...</p>
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
            {isLoadingMore && (
              <p className="col-span-full text-center text-gray-400">
                Ładowanie więcej...
              </p>
            )}
            {isReachingEnd && products.length > 0 && (
              <p className="col-span-full text-center text-gray-400">
                Brak nowych produktów
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
