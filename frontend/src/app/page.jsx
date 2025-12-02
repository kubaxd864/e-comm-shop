"use client";
import { useUser } from "@/components/UserProvider";
import { useToast } from "@/components/ToastProvider";
import Categories from "@/components/Categories";
import ProductBox from "@/components/ProductBox";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const { loading } = useUser();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/get_products")
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((err) => {
        addToast(err.response?.data.message, "error");
      });
  }, [addToast]);

  return (
    <main className="flex flex-1 w-full flex-col gap-9 bg-white text-center dark:bg-black">
      <Categories />
      {loading ? (
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Wczytywanie Produktów...
        </p>
      ) : (
        <>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Wybrane Dla Ciebie
          </h1>
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
                condition={product.item_condition}
                name={product.name}
                price={product.price}
                thumbnail={product.thumbnail}
                address={product.store_address}
                city={product.store_city}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
