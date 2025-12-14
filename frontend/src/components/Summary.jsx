"use client";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

export default function Summary({ step, setStep }) {
  const { itemsSum, deliverySum } = useCart();
  const router = useRouter();
  return (
    <div className="flex flex-col h-fit w-1/4 min-w-72 gap-2 bg-zinc-900 rounded-sm p-4">
      <h1 className="text-xl text-center pb-6">Podsumowanie Zamówienia</h1>
      <div className="flex flex-row w-full justify-between">
        <p>Wartość produktów:</p>
        <p>{itemsSum.toFixed(2)} zł</p>
      </div>
      <div className="flex flex-row w-full justify-between">
        <p>Dostawa od:</p>
        <p>{deliverySum.toFixed(2)} zł</p>
      </div>
      <div className="flex flex-row w-full justify-between border-t-[1.5px] border-gray-400 pt-5">
        <p className="flex justify-center items-center">Razem z dostawą:</p>
        <p className="text-2xl">{(itemsSum + deliverySum).toFixed(2)} zł</p>
      </div>
      <div className="flex flex-col gap-3 pt-5 w-full">
        <button type="submit" className="bg-blue-700 px-2 py-3 rounded-sm">
          {step === 1 ? "Dostawa" : step === 2 ? "Płatność" : null}
        </button>
        <button
          type="button"
          onClick={() => {
            step === 1 ? router.push("/basket") : setStep((prev) => prev - 1);
          }}
          className="border-2 border-gray-400 px-2 py-3 rounded-sm"
        >
          {step === 1 ? "Koszyk" : step === 2 ? "Dane" : "Wysyłka"}
        </button>
      </div>
    </div>
  );
}
