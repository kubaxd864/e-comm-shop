"use client";
import MessagesBox from "@/components/MessagesBox";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export default function Messages() {
  const orderId = 23;
  const { data, error, isLoading } = useSWR(
    "http://localhost:5000/api/get_rooms",
    fetcher,
  );
  useEffect(() => {
    if (!socket.connected) return;

    socket.emit("joinOrCreateChat", { orderId }, (res) => {
      if (res?.ok) {
        navigate(`/room/${res.roomId}`, { state: { login } });
      } else {
        console.error("joinOrCreateChat failed:", res?.error);
      }
    });
  }, [orderId]);
  console.log(data);
  return (
    <div className="flex w-full h-full flex-col gap-7 justify-center items-center px-6 py-12">
      <div className="flex flex-row w-full md:w-10/12 lg:w-9/12 xl:w-8/12 h-[600px] gap-2">
        <div className="flex flex-col w-1/4 gap-5 bg-bg-secondary rounded-2xl p-8">
          <p className="w-full text-xl">Twoje Chaty</p>
        </div>
        <MessagesBox />
      </div>
    </div>
  );
}
