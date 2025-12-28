"use client";
import useSWR from "swr";
import axios from "axios";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ToastProvider";
import { fetcher } from "@/lib/fetcher";

const statusStyles = {
  opłacone: "bg-orange-400/10 text-orange-500",
  potwierdzone: "bg-yellow-500/10 text-yellow-500",
  wysłane: "bg-green-500/10 text-green-500",
  anulowane: "bg-red-500/10 text-red-600",
};
const statusOptions = ["opłacone", "potwierdzone", "wysłane", "anulowane"];

export default function Orders() {
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();
  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:5000/api/admin/orders",
    fetcher
  );

  async function UpdateOrderStatus(id, status) {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/update_order_status`,
        { id, status },
        { withCredentials: true }
      );
      setEditingId(null);
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }
  const orders = data?.orders ?? [];
  return (
    <div className="flex flex-1 w-full flex-col gap-8 items-center px-6 py-12">
      <div className="flex flex-row w-full md:w-11/12 lg:w-9/12 xl:w-7/12">
        <h1 className="text-3xl font-semibold">Zamówienia</h1>
      </div>
      <div className="flex flex-col p-10 gap-6 w-full md:w-11/12 lg:w-9/12 xl:w-7/12 max-h-[630px] overflow-auto hide-scrollbar bg-bg-secondary rounded-lg">
        {isLoading ? (
          <p className="w-full text-center">Wczytywanie danych....</p>
        ) : error ? (
          <p className="w-full text-center">Błąd wczytywania danych</p>
        ) : (
          orders.map((order) => {
            const isEditing = editingId === order.id;
            return (
              <div
                key={order.id}
                className="flex justify-around items-center gap-6 p-4 rounded border border-border bg-bg-secondary"
              >
                <p className="font-semibold">{order.id}</p>
                <p>{order.name + " " + order.surname}</p>
                <p className="font-semibold">{order.total_amount}</p>
                <p>{order.created_at.split("T")[0]}</p>
                {!isEditing ? (
                  <p
                    className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                      statusStyles[order.status]
                    }`}
                  >
                    {order.status}
                  </p>
                ) : (
                  <select
                    defaultValue={order.status}
                    onChange={(e) =>
                      UpdateOrderStatus(order.id, e.target.value)
                    }
                    onBlur={() => setEditingId(null)}
                    className="appearance-none border border-border p-2 rounded-sm text-gray-400"
                  >
                    {statusOptions.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="bg-bg-secondary text-text-secondary"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() =>
                    setEditingId((prev) =>
                      prev === order.id ? null : order.id
                    )
                  }
                  className="px-3 py-1 text-sm cursor-pointer text-text-secondary"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
