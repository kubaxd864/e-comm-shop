"use client";
import WykresLiniowy from "@/components/LineChart";
import LatestOrders from "@/components/LatestOrders";
import LatestProducts from "@/components/LatestProducts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill, faCoins } from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import axios from "axios";

const fetcher = (url) => axios.get(url).then((r) => r.data);

export default function AdminPanel() {
  const { data } = useSWR(`http://localhost:5000/api/admin_data`, fetcher);
  const weeklyNewUsers = data?.weeklyNewUsers ?? [];
  const weeklysales = data?.weeklysales ?? [];
  const sum = data?.sum[0].total_sum ?? 0;
  const weeklysum = data?.weeklysum[0].weekly_sum ?? 0;
  const orders = data?.orders ?? [];
  const products = data?.products ?? [];
  const weeklyUsersSum = weeklyNewUsers.reduce(
    (acc, item) => acc + (Number(item?.new_users) || 0),
    0
  );
  const weeklySalesSum = weeklysales.reduce(
    (acc, item) => acc + (Number(item?.items_sold) || 0),
    0
  );
  return (
    <div className="flex flex-1 w-full flex-col items-center px-6 py-16">
      <div className="flex flex-col w-10/12 gap-10">
        <div className="flex flex-row gap-5">
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
          <div className="flex flex-col w-1/3 gap-5">
            <div className="flex flex-row justify-between w-full h-1/2 bg-bg-secondary rounded-lg p-5">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Zysk Całkowity</h2>
                <p className="text-3xl">{sum} zł</p>
              </div>
              <div className="bg-primary w-14 h-14 flex items-center justify-center rounded-full text-white">
                <FontAwesomeIcon icon={faMoneyBill}></FontAwesomeIcon>
              </div>
            </div>
            <div className="flex flex-row justify-between w-full h-1/2 bg-bg-secondary rounded-sm p-5">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Zysk z tego tygodnia</h2>
                <p className="text-3xl">{weeklysum} zł</p>
              </div>
              <div className="bg-primary w-14 h-14 flex items-center justify-center rounded-full text-white">
                <FontAwesomeIcon icon={faCoins}></FontAwesomeIcon>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatestProducts products={products} />
          <LatestOrders orders={orders} />
        </div>
      </div>
    </div>
  );
}
