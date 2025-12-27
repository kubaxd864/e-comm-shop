"use client";
import { useForm } from "react-hook-form";
import ImageUploader from "@/components/AddImages";
import ProductDetailsForm from "@/components/ProductDetailsForm";
import ProductDescription from "@/components/ProductDescription";
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
  const form = useForm();

  async function onSubmit(formValues) {
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });
      images.forEach((img) => {
        formData.append("images", img.file);
        formData.append("imageIsMain", img.isMain ? "1" : "0");
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
          form.reset();
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
    <div className="flex flex-1 w-full flex-col gap-7 items-center px-6 py-12">
      <h1 className="text-3xl font-semibold">Dodaj Produkt</h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col p-10 gap-4 w-11/12 lg:w-8/12 bg-bg-secondary rounded-lg"
      >
        <ProductDetailsForm form={form} categories={categories} shops={shops} />
        <ImageUploader images={images} setImages={setImages} />
        <ProductDescription form={form} />
        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            className="py-3 px-5 bg-primary text-text-secondary cursor-pointer rounded hover:bg-primary-hover"
          >
            {form.formState.isSubmitting
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
