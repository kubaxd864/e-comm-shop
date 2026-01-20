"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import axios from "axios";
import { useCart } from "@/hooks/useCart";
import { useIsDark } from "@/hooks/useIsDark";

export default function PaymentStep({ setStep }) {
  const { itemsSum, deliverySum } = useCart();
  const isDark = useIsDark();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const initialized = useRef(false);

  const appearance = useMemo(
    () => ({
      theme: isDark ? "night" : "stripe",
      variables: {
        colorPrimary: "#1347BE",
      },
    }),
    [isDark],
  );

  const elementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance,
    }),
    [clientSecret, appearance],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    async function initStripe() {
      const config = await axios.get(
        "http://localhost:5000/api/stripe/config",
        {
          withCredentials: true,
        },
      );
      setStripePromise(loadStripe(config.data.publishablekey));
      const amount = Math.round((itemsSum + deliverySum) * 100);
      const intent = await axios.post(
        "http://localhost:5000/api/stripe/create-payment-intent",
        { amount },
        { withCredentials: true },
      );
      setClientSecret(intent.data.clientSecret);
    }
    initStripe();
  }, []);

  if (!stripePromise || !clientSecret) {
    return <p className=" w-full text-center">Ładowanie płatności…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm setStep={setStep} />
    </Elements>
  );
}
