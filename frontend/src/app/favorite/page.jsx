"use client";
import { useFavorites } from "@/hooks/useFavorites";
import ProductBox from "@/components/ProductBox";

export default function Favorites() {
  const { favorites, isLoading, isError } = useFavorites();

  return (
    <main className="flex flex-1 w-full justify-center bg-white text-center dark:bg-black">
      <div className="flex flex-col w-10/12 m-10 gap-9">
        <h1 className="text-3xl font-bold">Ulubione Produkty</h1>
        {isLoading ? (
          <p>Ładowanie...</p>
        ) : isError ? (
          <p>Błąd podczas ładowania ulubionych</p>
        ) : favorites?.length === 0 ? (
          <p>Brak ulubionych produktów</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((f, idx) => (
              <ProductBox
                key={idx}
                id={f.id}
                name={f.name}
                price={f.price}
                thumbnail={f.thumbnail}
                condition={f.item_condition}
                address={f.store_address}
                city={f.store_city}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
