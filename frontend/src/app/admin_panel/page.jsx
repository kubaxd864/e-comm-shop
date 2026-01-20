"use client";
import WykresLiniowy from "@/components/LineChart";
import LatestOrders from "@/components/LatestOrders";
import LatestProducts from "@/components/LatestProducts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill, faCoins } from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function AdminPanel() {
  const { data } = useSWR(`http://localhost:5000/api/admin/data`, fetcher);
  const weeklyNewUsers = data?.weeklyNewUsers ?? [];
  const weeklysales = data?.weeklysales ?? [];
  const sum = data?.sum[0].total_sum ?? 0;
  const weeklysum = data?.weeklysum[0].weekly_sum ?? 0;
  const orders = data?.orders ?? [];
  const products = data?.products ?? [];
  const weeklyUsersSum = weeklyNewUsers.reduce(
    (acc, item) => acc + (Number(item?.new_users) || 0),
    0,
  );
  const weeklySalesSum = weeklysales.reduce(
    (acc, item) => acc + (Number(item?.items_sold) || 0),
    0,
  );
  return (
    <div className="flex flex-1 w-full flex-col px-4 py-10 sm:px-6 md:py-14">
      <div className="mx-auto flex w-11/12 lg:w-10/12 flex-col gap-8">
        <div className="grid w-full gap-6 xl:grid-cols-3">
          <div className="grid gap-6 sm:grid-cols-2 xl:col-span-2">
            <WykresLiniowy
              data={weeklysales}
              sum={weeklySalesSum}
              title={"Sprzedane Produkty"}
            />
            <WykresLiniowy
              data={weeklyNewUsers}
              sum={weeklyUsersSum}
              title={"Nowi Użytkownicy"}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <div className="flex h-full flex-col justify-between gap-4 rounded-xl bg-bg-secondary p-5 shadow-sm">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Zysk Całkowity</h2>
                <p className="text-3xl font-semibold">{sum} zł</p>
              </div>
              <div className="bg-primary flex h-14 w-14 items-center justify-center rounded-full text-white">
                <FontAwesomeIcon icon={faMoneyBill}></FontAwesomeIcon>
              </div>
            </div>
            <div className="flex h-full flex-col justify-between gap-4 rounded-xl bg-bg-secondary p-5 shadow-sm">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Zysk z tego tygodnia</h2>
                <p className="text-3xl font-semibold">{weeklysum} zł</p>
              </div>
              <div className="bg-primary flex h-14 w-14 items-center justify-center rounded-full text-white">
                <FontAwesomeIcon icon={faCoins}></FontAwesomeIcon>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <LatestProducts products={products} />
          <LatestOrders orders={orders} />
        </div>
      </div>
    </div>
  );
}
