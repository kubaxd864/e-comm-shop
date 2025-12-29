"use client";
import { useRouter } from "next/navigation";

export default function Completion() {
  const router = useRouter();
  return (
    <main className="flex flex-1 w-full justify-center items-center">
      <div className="flex flex-col gap-5 bg-bg-secondary p-10 m-10 text-center sm:text-left rounded-sm">
        <h1 className="text-3xl font-bold">Dziękujemy za zakupy!</h1>
        <p className="text-lg">
          Twoje zamówienie zostało przyjęte i wkrótce zostanie przygotowane do
          wysyłki.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-primary text-text-secondary py-3 rounded cursor-pointer hover:bg-primary-hover"
        >
          Wróć do Sklepu
        </button>
      </div>
    </main>
  );
}
