"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export default function ProductDescription({
  description,
  shop_id,
  shop_address,
  shop_city,
  shop_phone,
  shop_email,
  created_at,
}) {
  const [openedSection, setSection] = useState("Opis");
  const router = useRouter();

  function SameStoreProducts(shopId) {
    if (!shopId) return;
    router.push(`/categories?shop=${shopId}`);
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-3 pb-1">
        <button
          className={
            openedSection == "Opis"
              ? "text-lg font-bold underline decoration-2 underline-offset-4 decoration-blue-700"
              : null
          }
          onClick={() => setSection("Opis")}
        >
          Opis
        </button>
        <button
          className={
            openedSection == "Parametry"
              ? "text-lg font-bold underline decoration-2 underline-offset-4 decoration-blue-700"
              : null
          }
          onClick={() => setSection("Parametry")}
        >
          Parametry
        </button>
        <button
          className={
            openedSection == "Sprzedawca"
              ? "text-lg font-bold underline decoration-2 underline-offset-4 decoration-blue-700"
              : null
          }
          onClick={() => setSection("Sprzedawca")}
        >
          Sprzedawca
        </button>
      </div>
      {openedSection === "Opis" ? (
        <div className="flex flex-col gap-2">
          <p>Witamy!</p>
          <p>Dziś w Sprzedaży {description}</p>
        </div>
      ) : openedSection === "Parametry" ? (
        <div className="grid grid-flow-col grid-rows-4 gap-3">
          <p>Producent: Samsung</p>
          <p>Stan: Używane</p>
          <p>Typ: Etui</p>
          <p>Waga: 30.00g</p>
          <p>
            Data Dodania:{" "}
            {created_at
              ? format(parseISO(created_at), "dd.MM.yyyy HH:mm")
              : "Brak danych"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-fit">
          <p className="text-sm">
            Lokalizacja: {shop_address}, {shop_city}
          </p>
          <p className="text-sm">Telefon: {shop_phone}</p>
          <p className="text-sm">Email: {shop_email}</p>
          <p className="text-sm">Godziny Otwarcia: 10-18</p>
          <button
            onClick={() => SameStoreProducts(shop_id)}
            className="bg-blue-800 text-sm px-6 py-3 mt-1 rounded-sm cursor-pointer hover:bg-blue-700"
          >
            Inne Produkty tego Sprzedawcy
          </button>
        </div>
      )}
    </div>
  );
}
