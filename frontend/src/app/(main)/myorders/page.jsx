"use client";
import { useMemo } from "react";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const statusStyles = {
  opłacone: "bg-orange-400/10 text-orange-500",
  potwierdzone: "bg-yellow-500/10 text-yellow-500",
  wysłane: "bg-green-500/10 text-green-500",
  anulowane: "bg-red-500/10 text-red-600",
};

export default function Myorders() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:5000/api/my_orders",
    fetcher,
  );
  const orders = useMemo(() => data?.orders ?? [], [data]);
  return (
    <main className="flex flex-1 w-full justify-center p-10">
      <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <h1 className="text-3xl font-bold text-center mb-8">
          Twoje zamówienia
        </h1>
        {isLoading ? (
          <p className="w-full text-center">Wczytywanie zamówień…</p>
        ) : error ? (
          <p className="w-full text-center">Błąd podczas ładowania zamówień</p>
        ) : orders.length === 0 ? (
          <p className="w-full text-center">Brak zamówień</p>
        ) : (
          <ul className="space-y-5">
            {orders.map((o, idx) => (
              <li
                key={idx}
                className="flex flex-col p-4 rounded gap-3 bg-bg-secondary"
              >
                <div className="flex flex-row justify-between border-b border-border pb-3">
                  <p className="flex flex-row gap-2 justify-center items-center">
                    <FontAwesomeIcon icon={faBoxOpen}></FontAwesomeIcon>
                    Zamówienie #{o.id}{" "}
                  </p>
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                      statusStyles[o.status]
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                {o?.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 w-full"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <img
                        src={item.thumbnail}
                        alt={item.product_name}
                        className="w-24 h-16 object-contain rounded-md bg-white p-1"
                      />
                      <Link href={`/product/${item.product_id}`}>
                        <p>{item.product_name}</p>
                      </Link>
                    </div>
                    <div className="ml-0 sm:ml-auto">
                      <p>
                        {item.quantity} x {item.price} zł
                      </p>
                    </div>
                    <div className="ml-0 sm:ml-auto">
                      <p className="font-bold">{item.price} zł</p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-row justify-between border-t border-border pt-3">
                  <p className="">Razem z dostawą:</p>
                  <p className="font-bold">{o.total_amount} zł</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
