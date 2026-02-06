"use client";
import React from "react";
import CategoryOption from "@/components/CategoryOption";
import ChatButton from "./ChatButton";
import { useState } from "react";

export default function ProductDetailsForm({ form, categories, shops }) {
  const {
    register,
    formState: { errors },
    watch,
    getValues,
  } = form;
  const selectedCategory = watch("category");
  const [parameters, setParameters] = useState("");
  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Szczegóły Produktu</h2>
        <p className="text-sm text-gray-400">
          Dane produktu dostępne dla klienta.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label>Nazwa Produktu</label>
        <input
          type="text"
          {...register("product_name", {
            required: "Nazwa produktu jest wymagana",
            minLength: { value: 5, message: "Za krótka nazwa produktu" },
          })}
          placeholder="Nazwa Produktu"
          className="w-full border-[1.5px] border-border px-2 py-3 rounded-sm"
        />
        {errors.product_name && (
          <p className="text-sm text-red-400">{errors.product_name.message}</p>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label>Kategoria</label>
          <select
            {...register("category", {
              required: "Wybierz kategorię produktu",
            })}
            defaultValue={""}
            className="appearance-none w-full border border-border px-2 py-3 rounded-sm text-gray-400"
          >
            <option
              value=""
              disabled
              className="bg-bg-secondary text-text-secondary"
            >
              Wybierz Kategorię
            </option>
            {categories.map((node) => (
              <CategoryOption key={node.id} node={node} depth={0} />
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-400">{errors.category.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label>Stan</label>
          <select
            {...register("condition", { required: "Wybierz stan produktu" })}
            defaultValue={""}
            className="appearance-none w-full border border-border px-2 py-3 rounded-sm text-gray-400"
          >
            <option
              value=""
              disabled
              className="bg-bg-secondary text-text-secondary"
            >
              Wybierz Stan
            </option>
            <option
              value="Nowe"
              className="bg-bg-secondary text-text-secondary"
            >
              Nowe
            </option>
            <option
              value="Używane"
              className="bg-bg-secondary text-text-secondary"
            >
              Używane
            </option>
          </select>
          {errors.condition && (
            <p className="text-sm text-red-400">{errors.condition.message}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-2 w-full md:w-3/4">
          <label>Wymiary</label>
          <input
            {...register("size", {
              required: "Podaj wymiary produktu",
              pattern: {
                value:
                  /^\d+(?:[.,]\d+)?\/\d+(?:[.,]\d+)?\/\d+(?:[.,]\d+)?\/\d+(?:[.,]\d+)?$/,
                message: "Format: waga/szerokość/wysokość/długość",
              },
            })}
            placeholder="Wymiary Produktu (Waga/Szerokość/Wysokość/Długość)"
            className="w-full border border-border px-2 py-3 rounded-sm"
          />
          {errors.size && (
            <p className="text-sm text-red-400">{errors.size.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label>Ilość</label>
          <input
            type="number"
            {...register("quantity", {
              required: "Podaj ilość sztuk produktu",
            })}
            placeholder="Ilość Produktu"
            className="w-full border border-border px-2 py-3 rounded-sm"
          />
          {errors.quantity && (
            <p className="text-sm text-red-400">{errors.quantity.message}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label>Sklep</label>
          <select
            {...register("shop", { required: "Wybierz sklep" })}
            defaultValue={""}
            className="appearance-none w-full border border-border px-2 py-3 rounded-sm text-gray-400"
          >
            <option
              value=""
              disabled
              className="bg-bg-secondary text-text-secondary"
            >
              Wybierz Sklep
            </option>
            {shops.map((e) => (
              <option
                key={e.id}
                value={e.id}
                className="bg-bg-secondary text-text-secondary"
              >
                {e.name}
              </option>
            ))}
          </select>
          {errors.shop && (
            <p className="text-sm text-red-400">{errors.shop.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label>Cena</label>
          <input
            type="number"
            {...register("price", { required: "Podaj cenę produktu" })}
            placeholder="Cena Produktu"
            className="w-full border border-border px-2 py-3 rounded-sm"
          />
          {errors.price && (
            <p className="text-sm text-red-400">{errors.price.message}</p>
          )}
        </div>
        {selectedCategory == "16" ? (
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label>Promocyjna Cena</label>
            <input
              type="number"
              {...register("promotion_price", {
                required: "Podaj cenę promocyjną",
              })}
              placeholder="Cena Promocyjna"
              className="w-full border border-border px-2 py-3 rounded-sm"
            />
            {errors.promotion_price && (
              <p className="text-sm text-red-400">
                {errors.promotion_price.message}
              </p>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Parametry Produktu</h2>
        <div className="flex w-full relative">
          <textarea
            rows={6}
            value={parameters}
            placeholder="Parametry produktu np. Marka: Sony, Model:Vaio"
            className="border border-border p-3 rounded-sm w-full"
            {...register("parameters", {
              required: "Podaj parametry produktu",
              minLength: { value: 10, message: "Podaj parametry Produktu" },
            })}
          />
          <ChatButton
            getValues={getValues}
            prompt={`Wygeneruj 8 parametrów które zapiszesz w formacie wypisując je po przecinku tak jak tutaj: Marka: text, Model:text, odnoszące się do realnych cech produktu takich jak kolor, 
              stan czy inne przydatne parametry w zależności od kategorii którą sprawdź w zależności od nazwy produktu dla produktu o takich parametrach`}
            setParameters={setParameters}
          />
        </div>
        {errors.parameters && (
          <p className="text-sm text-red-400">{errors.parameters.message}</p>
        )}
      </div>
    </div>
  );
}
