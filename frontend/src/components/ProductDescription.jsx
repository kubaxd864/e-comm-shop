"use client";
import React from "react";
import ChatButton from "./ChatButton";
import { useState } from "react";

export default function ProductDescription({ form }) {
  const {
    register,
    formState: { errors },
    getValues,
  } = form;
  const [description, setDescription] = useState("");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Opis Produktu</h2>
        <p className="text-sm text-gray-400">
          Opis produktu widoczny na stronie
        </p>
      </div>
      <div className="flex w-full relative">
        <textarea
          rows={6}
          value={description}
          placeholder="Opis Produktu"
          className="border border-border p-3 rounded-sm w-full"
          {...register("description", {
            required: "Podaj opis produktu",
            minLength: { value: 30, message: "Za krótki opis produktu" },
          })}
        />
        <ChatButton
          getValues={getValues}
          prompt={`Wygeneruj 3 zdaniowy opis produktu zachęcający do zakupu odnoszący się do realnych cech produktu takich jak kolor, 
          stan czy inne przydatne parametry w zależności od kategorii produktu`}
          setParameters={setDescription}
        />
      </div>
      {errors.description && (
        <p className="text-sm text-red-400">{errors.description.message}</p>
      )}
    </div>
  );
}
