"use client";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";

export default function PaymentForm({ setStep }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { itemsSum, deliverySum } = useCart();

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (error) {
      console.error(error.message);
    }

    setIsProcessing(false);
  };

  return (
    <div className="flex flex-row w-full gap-5">
      <PaymentElement
        options={{
          layout: { type: "tabs" },
          defaultValues: { paymentMethod: { type: "card" } },
        }}
        className="w-3/4 bg-zinc-900 rounded-sm p-5"
      />
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
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="bg-blue-600 py-3 rounded"
          >
            {isProcessing ? "Przetwarzanie…" : "Zapłać"}
          </button>
          <button
            type="button"
            onClick={() => setStep((prev) => prev - 1)}
            className="border-2 border-gray-400 px-2 py-3 rounded-sm"
          >
            Wysyłka
          </button>
        </div>
      </div>
    </div>
  );
}
