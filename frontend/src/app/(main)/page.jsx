"use client";
import Categories from "@/components/Categories";
import ProductBox from "@/components/ProductBox";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useEffect } from "react";

const PAGE_SIZE = 20;

export default function Home() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.products?.length) return null;
    return `http://localhost:5000/api/get_products?limit=${PAGE_SIZE}&offset=${
      pageIndex * PAGE_SIZE
    }`;
  };
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher
  );
  const products = data
    ? [].concat(...data.map((page) => page.products ?? []))
    : [];
  const isReachingEnd =
    data && data[data.length - 1]?.products?.length < PAGE_SIZE;
  const isLoadingMore = isValidating && !isReachingEnd;
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !isLoadingMore &&
      !isReachingEnd
    ) {
      setSize(size + 1);
    }
  }, [isLoadingMore, isReachingEnd, setSize, size]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <main className="flex flex-1 flex-col gap-9 w-full text-center">
      <Categories />
      <h1 className="text-4xl font-semibold tracking-tight">
        Wybrane Dla Ciebie
      </h1>
      {products.length === 0 && isValidating ? (
        <p>Wczytywanie produktów...</p>
      ) : error ? (
        <p>Błąd pobierania Danych</p>
      ) : (
        <div
          className="grid gap-15 max-w-[1650px] w-full mx-auto p-10"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {products.map((product) => (
            <ProductBox
              key={product.id}
              id={product.id}
              category_id={product.category_id}
              condition={product.item_condition}
              name={product.name}
              promotion_price={product.promotion_price}
              price={product.price}
              thumbnail={product.thumbnail}
              address={product.store_address}
              city={product.store_city}
            />
          ))}
          {isLoadingMore && (
            <p className="col-span-full text-lg text-gray-400">
              Ładowanie więcej...
            </p>
          )}
          {isReachingEnd && products.length > 0 && (
            <p className="col-span-full text-lg text-gray-400">
              Brak nowych produktów
            </p>
          )}
        </div>
      )}
    </main>
  );
}
