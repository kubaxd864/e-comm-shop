import useSWR from "swr";
import axios from "axios";
import { useToast } from "@/components/ToastProvider";
import { useMemo, useState, useEffect } from "react";

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

export function useCart() {
  const { addToast } = useToast();
  const { data, error, mutate, isLoading } = useSWR(
    "http://localhost:5000/api/cart",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const groupedByStore = useMemo(() => data?.groupedByStore ?? [], [data]);
  const itemsSum = useMemo(() => data?.itemsSum ?? 0, [data]);
  const deliverySum = useMemo(() => data?.deliverySum ?? 0, [data]);
  const deliverySelections = useMemo(
    () => data?.deliverySelections ?? 0,
    [data]
  );

  async function UpdateDeliveryPrice(storeId, newPrice) {
    await axios.post(
      "http://localhost:5000/api/cart/delivery",
      {
        storeId,
        price: newPrice,
      },
      { withCredentials: true }
    );

    await mutate();
  }

  async function addToCart(productId) {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/cart/${productId}`,
        {},
        {
          withCredentials: true,
        }
      );
      await mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response.data.message, "error");
    }
  }

  async function lowerQuantity(productId) {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/cart/lowerquantity/${productId}`,
        {},
        {
          withCredentials: true,
        }
      );
      await mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response.data.message, "error");
    }
  }

  async function deleteFromCart(productId) {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        {
          withCredentials: true,
        }
      );
      await mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response.data.message, "error");
    }
  }

  return {
    items,
    groupedByStore,
    itemsSum,
    deliverySum,
    deliverySelections,
    isLoading,
    error,
    UpdateDeliveryPrice,
    addToCart,
    lowerQuantity,
    deleteFromCart,
    refresh: mutate,
  };
}
