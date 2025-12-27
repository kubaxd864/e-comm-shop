"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ProductDetailsForm from "@/components/ProductDetailsForm";
import ProductDescription from "@/components/ProductDescription";
import ImageUploader from "@/components/AddImages";

const fetcher = (url) => axios.get(url).then((r) => r.data);

export default function UpdateProduct() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id") ?? "";
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("");
  const { data: productResponse } = useSWR(
    `http://localhost:5000/api/get_product/data/${productId}`,
    fetcher
  );
  const { data } = useSWR(`http://localhost:5000/api/get_stores`, fetcher);
  const shops = data?.stores ?? [];
  const categories = data?.categories ?? [];
  const productData = productResponse?.product ?? null;
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const parsedSize = useMemo(() => {
    if (!productData?.size) return "";
    try {
      const { weight, width, height, length } = JSON.parse(productData.size);
      return `${weight}/${width}/${height}/${length}`;
    } catch {
      return "";
    }
  }, [productData?.size]);

  useEffect(() => {
    if (!productData?.images) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImages(
      productData.images
        .split("||")
        .map((url) => ({
          id: crypto.randomUUID(),
          url,
          file: null,
          isMain: url === productData.thumbnail,
        }))
        .sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1))
    );
  }, [productData?.images]);

  const form = useForm();

  useEffect(() => {
    if (!productData) return;
    form.reset({
      product_name: productData.name,
      category: productData.category_id,
      condition: productData.item_condition,
      size: parsedSize,
      quantity: productData.quantity,
      shop: productData.shop_id,
      price: productData.price,
      description: productData.description,
    });
  }, [productData, parsedSize, form]);

  const onSubmit = async (formValues) => {
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) =>
        formData.append(key, value)
      );
      images.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file);
          formData.append("imageIsMain", img.isMain ? "1" : "0");
        } else {
          formData.append("existingImages", img.url);
          formData.append("existingImageIsMain", img.isMain ? "1" : "0");
        }
      });
      const res = await axios.put(
        `http://localhost:5000/api/admin/update_product/${productId}`,
        formData,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setStatus(res.data?.message);
        setTimeout(() => {
          router.push("/admin_panel/products");
        }, 1000);
      }
    } catch (err) {
      setStatus(err.response?.data?.message || "Błąd serwera");
      setTimeout(() => setStatus(""), 1000);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col gap-7 items-center px-6 py-12">
      <h1 className="text-3xl font-semibold">Zaktualizuj Produkt</h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col p-10 gap-4 w-11/12 lg:w-8/12 bg-bg-secondary rounded-lg"
      >
        {!productData ? (
          <div className="p-10 text-center">Ładowanie danych produktu...</div>
        ) : (
          <>
            <ProductDetailsForm
              form={form}
              categories={categories}
              shops={shops}
            />
            <ImageUploader images={images} setImages={setImages} />
            <ProductDescription form={form} />
            <div className="flex items-center justify-center mt-8">
              <button
                type="submit"
                className="py-3 px-5 bg-primary text-text-secondary cursor-pointer rounded hover:bg-primary-hover"
              >
                {form.formState.isSubmitting
                  ? "Aktualizowanie..."
                  : status !== ""
                  ? status
                  : "Zaktualizuj Produkt"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
