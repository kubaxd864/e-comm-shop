import useSWR from "swr";
import api from "@/lib/axios";
import { useToast } from "@/components/ToastProvider";
import { useMemo } from "react";
import { useUser } from "@/components/UserProvider";

const fetcher = (url) => api.get(url).then((res) => res.data);

export function useCart() {
  const { user } = useUser();
  const { addToast } = useToast();
  const { data, error, mutate, isLoading } = useSWR(
    !!user ? "http://localhost:5000/api/cart" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const items = useMemo(() => data?.items ?? [], [data]);
  const groupedByStore = useMemo(() => data?.groupedByStore ?? [], [data]);
  const itemsSum = useMemo(() => data?.itemsSum ?? 0, [data]);
  const deliverySum = useMemo(() => data?.deliverySum ?? 0, [data]);
  const deliverySelections = useMemo(
    () => data?.deliverySelections ?? {},
    [data]
  );

  async function updateDeliveryPrice(storeId, newPrice) {
    await api.post(
      "http://localhost:5000/api/cart/delivery",
      { storeId, price: newPrice },
      { withCredentials: true }
    );
    mutate();
  }

  async function addToCart(productId) {
    try {
      const res = await api.post(`http://localhost:5000/api/cart/${productId}`);
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      !!user ? addToast(err.response?.data?.message ?? "Błąd", "error") : null;
    }
  }

  async function lowerQuantity(productId) {
    try {
      const res = await api.post(
        `http://localhost:5000/api/cart/lowerquantity/${productId}`
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  async function deleteFromCart(productId) {
    try {
      const res = await api.delete(
        `http://localhost:5000/api/cart/${productId}`
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd", "error");
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
    updateDeliveryPrice,
    addToCart,
    lowerQuantity,
    deleteFromCart,
    refresh: mutate,
  };
}
