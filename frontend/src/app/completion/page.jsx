"use client";
import { useRouter } from "next/navigation";

export default function Completion() {
  const router = useRouter();
  return (
    <main className="flex flex-1 w-full justify-center items-center bg-white dark:bg-black">
      <div className="flex flex-col gap-5 bg-zinc-900 p-10 rounded-sm">
        <h1 className="text-3xl font-bold">Dziękujemy za zakupy!</h1>
        <p className="text-lg">
          Twoje zamówienie zostało przyjęte i wkrótce zostanie przygotowane do
          wysyłki.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-blue-600 py-3 rounded cursor-pointer"
        >
          Wróć do Sklepu
        </button>
      </div>
    </main>
  );
}
