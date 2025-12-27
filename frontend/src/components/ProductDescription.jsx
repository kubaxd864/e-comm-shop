"use client";
import React from "react";

export default function ProductDescription({ form }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Opis Produktu</h2>
        <p className="text-sm text-gray-400">
          Opis produktu widoczny na stronie
        </p>
      </div>
      <textarea
        rows={6}
        placeholder="Opis Produktu"
        className="border border-border p-3 rounded-sm"
        {...register("description", {
          required: "Podaj opis produktu",
          minLength: { value: 30, message: "Za krótki opis produktu" },
        })}
      />
      {errors.description && (
        <p className="text-sm text-red-400">{errors.description.message}</p>
      )}
    </div>
  );
}
