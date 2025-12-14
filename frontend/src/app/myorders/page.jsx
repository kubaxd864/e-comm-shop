"use client";
import { useMemo } from "react";
import api from "@/lib/axios";
import useSWR from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const fetcher = (url) =>
  api.get(url, { withCredentials: true }).then((res) => res.data);

export default function Myorders() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:5000/api/my_orders",
    fetcher
  );
  const orders = useMemo(() => data?.orders ?? [], [data]);
  console.log(orders);
  return (
    <main className="flex flex-1 w-full justify-center p-10 bg-white dark:bg-black">
      <div className="w-6/12">
        <h1 className="text-3xl text-center mb-8">Twoje zamówienia</h1>
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
                className="flex flex-col p-4 rounded gap-3 bg-zinc-50 dark:bg-zinc-900"
              >
                <div className="flex flex-row justify-between border-b border-gray-400 pb-3">
                  <p className="flex flex-row gap-2 justify-center items-center">
                    <FontAwesomeIcon icon={faBoxOpen}></FontAwesomeIcon>
                    Zamówienie #{idx}{" "}
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-bold capitalize">{o.status}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {o?.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-center gap-3 w-full"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail}
                          alt={item.product_name}
                          className="w-24 h-16 object-contain rounded-md bg-white p-1"
                        />
                        <Link href={`/product/${item.product_id}`}>
                          <p>{item.product_name}</p>
                        </Link>
                      </div>
                      <div className="ml-auto">
                        <p>
                          {item.quantity} x {item.price} zł
                        </p>
                      </div>
                      <div className="ml-auto">
                        <p className="font-bold">{item.price} zł</p>
                      </div>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
