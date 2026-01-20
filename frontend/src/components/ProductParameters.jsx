"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export default function ProductParameters({
  description,
  parameters,
  shop_id,
  shop_address,
  shop_city,
  shop_phone,
  shop_email,
  created_at,
}) {
  const [openedSection, setSection] = useState("Opis");
  const router = useRouter();
  const parametry =
    typeof parameters === "string"
      ? JSON.parse(parameters)
      : (parameters ?? {});
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
              ? "text-lg font-bold underline decoration-2 underline-offset-4 decoration-primary"
              : null
          }
          onClick={() => setSection("Opis")}
        >
          Opis
        </button>
        <button
          className={
            openedSection == "Parametry"
              ? "text-lg font-bold underline decoration-2 underline-offset-4 decoration-primary"
              : null
          }
          onClick={() => setSection("Parametry")}
        >
          Parametry
        </button>
        <button
          className={
            openedSection == "Sprzedawca"
              ? "text-lg font-bold underline decoration-2 underline-offset-4 decoration-primary"
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
          {Object.entries(parametry).map(([label, value]) => (
            <p key={label}>
              <span className="font-semibold capitalize">{label}:</span> {value}
            </p>
          ))}
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
          <div className="flex flex-row gap-3 mt-1.5">
            <button
              onClick={() => SameStoreProducts(shop_id)}
              className="bg-primary text-text-secondary text-sm px-6 py-3 rounded-sm cursor-pointer hover:bg-primary-hover"
            >
              Inne Produkty tego Sprzedawcy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
