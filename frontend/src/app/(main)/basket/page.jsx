"use client";
import { useCart } from "@/hooks/useCart";
import CartItem from "@/components/CartItem";
import { useRouter } from "next/navigation";

export default function Basket() {
  const { items, groupedByStore, itemsSum, deliverySum, isLoading, error } =
    useCart();
  const router = useRouter();

  return (
    <main className="flex flex-1 w-full justify-center">
      <div className="flex flex-col w-10/12 m-10 items-center gap-9">
        <h1 className="text-3xl font-bold text-center">Twój Koszyk</h1>
        {isLoading ? (
          <div>
            <p>Ładowanie...</p>
          </div>
        ) : error ? (
          <div>
            <p>Błąd podczas ładowania danych</p>
          </div>
        ) : items?.length === 0 ? (
          <p>Koszyk jest pusty</p>
        ) : (
          <div className="flex flex-row gap-4 w-full justify-center">
            <div className="flex flex-col gap-4">
              {groupedByStore.map((el, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1 p-4 bg-bg-secondary"
                >
                  <p className="">Przesyłka od {el.store_name}</p>
                  {el.items.map((el, idx) => (
                    <CartItem
                      key={idx}
                      id={el.id}
                      name={el.name}
                      quantity={el.quantity}
                      price={el.price}
                      thumbnail={el.thumbnail}
                    />
                  ))}
                  <p className="pt-2 p-1 text-right border-t-[1.5px] border-t-gray-400">
                    Dostawa od: {el.cheapestdelivery} zł
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col h-fit w-[25%] min-w-72 gap-2 bg-bg-secondary rounded-sm p-4">
              <div className="flex flex-row w-full justify-between">
                <p>Wartość produktów:</p>
                <p>{itemsSum.toFixed(2)} zł</p>
              </div>
              <div className="flex flex-row w-full justify-between">
                <p>Dostawa od:</p>
                <p>{deliverySum.toFixed(2)} zł</p>
              </div>
              <div className="flex flex-row w-full justify-between border-t-[1.5px] border-gray-400 pt-5">
                <p className="flex justify-center items-center">
                  Razem z dostawą:
                </p>
                <p className="text-2xl">
                  {(itemsSum + deliverySum).toFixed(2)} zł
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-5 w-full">
                <button
                  onClick={() => router.push(`/order`)}
                  className="bg-primary px-2 py-3 rounded-sm cursor-pointer text-text-secondary hover:bg-primary-hover"
                >
                  Finalizuj Zamówienie
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="border-2 border-border px-2 py-3 rounded-sm cursor-pointer"
                >
                  Kontynuuj Zakupy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
