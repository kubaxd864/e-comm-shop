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
        "http://localhost:5000/api/admin/update_order_status",
        { id, status },
        { withCredentials: true }
      );
      setEditingId(null);
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  const orders = data?.orders ?? [];

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="w-full md:w-11/12 lg:w-9/12 xl:w-7/12">
        <h1 className="text-3xl font-semibold">Zamówienia</h1>
      </div>

      <div className="flex w-full md:w-11/12 lg:w-9/12 xl:w-7/12 flex-col gap-4 rounded-lg bg-bg-secondary p-6 max-h-[85vh] overflow-auto hide-scrollbar">
        {isLoading ? (
          <p className="text-center">Wczytywanie danych…</p>
        ) : error ? (
          <p className="text-center">Błąd wczytywania danych</p>
        ) : (
          orders.map((order) => {
            const isEditing = editingId === order.id;
            return (
              <div
                key={order.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-2 items-center justify-items-center rounded border border-border bg-bg-secondary p-4"
              >
                <div className="flex gap-3 justify-between md:block">
                  <span className="text-text-tertiary md:hidden">ID</span>
                  <span className="font-semibold">{order.id}</span>
                </div>

                <div className="flex gap-3 justify-between md:block min-w-0">
                  <span className="text-text-tertiary md:hidden">Klient</span>
                  <span className="truncate">
                    {order.name} {order.surname}
                  </span>
                </div>

                <div className="flex gap-3 justify-between md:block">
                  <span className="text-text-tertiary md:hidden">Kwota</span>
                  <span className="font-semibold">{order.total_amount} zł</span>
                </div>

                <div className="flex gap-3 justify-between md:block">
                  <span className="text-text-tertiary md:hidden">Data</span>
                  <span>{order.created_at.split("T")[0]}</span>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                        statusStyles[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  ) : (
                    <select
                      defaultValue={order.status}
                      onChange={(e) =>
                        UpdateOrderStatus(order.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      className="border border-border p-2 rounded text-sm bg-bg-secondary text-text-secondary"
                    >
                      {statusOptions.map((item) => (
                        <option key={item} value={item}>
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
                    className="p-2 hover:text-primary"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
