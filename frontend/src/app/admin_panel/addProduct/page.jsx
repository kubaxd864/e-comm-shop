"use client";
import { useForm } from "react-hook-form";
import ImageUploader from "@/components/AddImages";
import React, { useState } from "react";
import useSWR from "swr";
import axios from "axios";

const fetcher = (url) => axios.get(url).then((r) => r.data);

export default function AddProduct() {
  const { data } = useSWR(`http://localhost:5000/api/get_stores`, fetcher);
  const shops = data?.stores ?? [];
  const categories = data?.categories ?? [];
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(formValues) {
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });
      images.forEach((img) => {
        formData.append("images", img.file);
      });
      const res = await axios.post(
        "http://localhost:5000/api/admin/add_product",
        formData,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        setStatus(res.data?.message);
        setTimeout(() => {
          reset();
          setImages([]);
          setStatus("");
        }, 5000);
      }
    } catch (err) {
      setStatus(err.response.data?.message);
      setTimeout(() => {
        setStatus("");
      }, 5000);
    }
  }
  return (
    <div className="flex flex-1 w-full flex-col gap-7 items-center px-6 py-12 bg-white dark:bg-black">
      <h1 className="text-3xl font-semibold">Dodaj Produkt</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col p-10 gap-4 w-8/12 bg-zinc-900 rounded-lg"
      >
        <div className="flex flex-col gap-4 p-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Szczegóły Produktu</h2>
            <p className="text-sm text-gray-300">
              Dane produktu dostępne dla klienta.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label>Nazwa Produktu</label>
            <input
              type="text"
              name="product_name"
              {...register("product_name", {
                required: "Nazwa produktu jest wymagana",
                minLength: { value: 5, message: "Za krótka nazwa produktu" },
              })}
              placeholder="Nazwa Produktu"
              className={`w-full border-[1.5px] border-gray-500 px-2 py-3 rounded-sm`}
            ></input>
            {errors.product_name ? (
              <p className="text-sm text-red-400">
                {errors.product_name?.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-row gap-5">
            <div className="flex flex-col gap-2 w-1/2">
              <label>Kategoria</label>
              <select
                name="category"
                {...register("category", {
                  required: "Wybierz kategorię produktu",
                })}
                defaultValue={""}
                className="appearance-none w-full border border-gray-500 px-2 py-3 rounded-sm text-gray-400"
              >
                <option value="" disabled className="bg-zinc-900 text-white">
                  Wybierz Kategorię
                </option>
                {categories.map((e) => (
                  <React.Fragment key={e.id}>
                    <option value={e.id} className="bg-zinc-900 text-white">
                      {e.name}
                    </option>
                    {e.children?.length > 0 &&
                      e.children.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          className="bg-zinc-900 text-white"
                        >
                          {"\u00A0\u00A0"}↳ {c.name}
                        </option>
                      ))}
                  </React.Fragment>
                ))}
              </select>
              {errors.category ? (
                <p className="text-sm text-red-400">
                  {errors.category?.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label>Stan</label>
              <select
                name="condition"
                {...register("condition", {
                  required: "Wybierz stan produktu",
                })}
                defaultValue={""}
                className="appearance-none w-full border border-gray-500 px-2 py-3 rounded-sm text-gray-400"
              >
                <option value="" disabled className="bg-zinc-900 text-white">
                  Wybierz Stan
                </option>
                <option value="Nowe" className="bg-zinc-900 text-white">
                  Nowy
                </option>
                <option value="Używane" className="bg-zinc-900 text-white">
                  Używany
                </option>
              </select>
              {errors.condition ? (
                <p className="text-sm text-red-400">
                  {errors.condition?.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-row gap-5">
            <div className="flex flex-col gap-2 w-3/4">
              <label>Wymiary</label>
              <input
                name="size"
                {...register("size", {
                  required: "Podaj wymiary produktu",
                })}
                placeholder="Wymiary Produktu (Waga/Szerokość/Wysokość/Długość)"
                className="w-full border border-gray-500 px-2 py-3 rounded-sm"
              />
              {errors.size ? (
                <p className="text-sm text-red-400">{errors.size?.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 w-1/4">
              <label>Ilość</label>
              <input
                name="quantity"
                {...register("quantity", {
                  required: "Podaj ilość sztuk produktu",
                })}
                placeholder="Ilość Produktu"
                className="w-full border border-gray-500 px-2 py-3 rounded-sm"
              />
              {errors.size ? (
                <p className="text-sm text-red-400">{errors.size?.message}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-row gap-5">
            <div className="flex flex-col gap-2 w-1/2">
              <label>Sklep</label>
              <select
                name="shop"
                {...register("shop", {
                  required: "Wybierz Sklep w którym jest Produkt",
                })}
                defaultValue={""}
                className="appearance-none w-full border border-gray-500 px-2 py-3 rounded-sm text-gray-400"
              >
                <option value="" disabled className="bg-zinc-900 text-white">
                  Wybierz Sklep
                </option>
                {shops.map((e) => (
                  <option
                    key={e.id}
                    value={e.id}
                    className="bg-zinc-900 text-white"
                  >
                    {e.name}
                  </option>
                ))}
              </select>
              {errors.shop ? (
                <p className="text-sm text-red-400">{errors.shop?.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label>Cena</label>
              <input
                name="price"
                {...register("price", {
                  required: "Podaj cenę produktu",
                })}
                type="number"
                placeholder="Cena Produktu"
                className="w-full border border-gray-500 px-2 py-3 rounded-sm"
              />
              {errors.price ? (
                <p className="text-sm text-red-400">{errors.price?.message}</p>
              ) : null}
            </div>
          </div>
        </div>
        <ImageUploader images={images} setImages={setImages} />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Opis Produktu</h2>
            <p className="text-sm text-gray-300">
              Opis produktu widoczny na stronie
            </p>
          </div>
          <textarea
            name="description"
            {...register("description", {
              required: "Podaj opis produktu",
              minLength: { value: 30, message: "Za krótki opis produktu" },
            })}
            rows={6}
            className="border border-gray-400 p-3"
            placeholder="Opis Produktu"
          />
          {errors.description ? (
            <p className="text-sm text-red-400">
              {errors.description?.message}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            className="py-3 px-5 bg-blue-700 cursor-pointer rounded"
          >
            {isSubmitting
              ? "Dodawanie..."
              : status !== ""
              ? status
              : "Dodaj Produkt"}
          </button>
        </div>
      </form>
    </div>
  );
}
