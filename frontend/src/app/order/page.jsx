"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ToastProvider";
import UserData from "@/components/UserDataForm";
import DeliveryOptions from "@/components/DeliveryOptions";
import Summary from "@/components/Summary";
import Payment from "@/components/Payment";
import axios from "axios";
import { useUser } from "@/components/UserProvider";

export default function CheckoutForm() {
  const methods = useForm();
  const { user, refreshUser } = useUser();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);

  const submit = async (data) => {
    sessionStorage.setItem("checkoutData", JSON.stringify(data));

    if (data.save_data) {
      try {
        const res = await axios.put(
          "/api/user_update",
          { id: user.id, county: user.county, ...data },
          { withCredentials: true }
        );
        addToast(res.data?.message ?? "Dane zapisane", "success");
        await refreshUser();
      } catch (err) {
        addToast("Błąd zapisu danych", "error");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  return (
    <main className="flex flex-1 w-full justify-center bg-white dark:bg-black">
      <div className="w-9/12 mt-10">
        <h1 className="text-3xl text-center mb-8">
          {step === 1
            ? "Dane Zamówienia"
            : step === 2
            ? "Opcje Wysyłki"
            : "Płatność"}
        </h1>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submit)} className="flex gap-6">
            {step === 1 && <UserData />}
            {step === 2 && <DeliveryOptions />}
            {step === 3 && <Payment setStep={setStep} />}

            {step !== 3 ? <Summary step={step} setStep={setStep} /> : null}
          </form>
        </FormProvider>
      </div>
    </main>
  );
}
