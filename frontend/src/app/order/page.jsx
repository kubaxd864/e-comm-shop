"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ToastProvider";
import UserData from "@/components/UserDataForm";
import Summary from "@/components/Summary";
import DeliveryOptions from "@/components/DeliveryOptions";
import Payment from "@/components/Payment";

export default function CheckoutForm() {
  const methods = useForm();
  const [step, setStep] = useState(1);
  const submit = (data) => {
    if (data.save_data) {
      console.log("Zapisano do bazy");
    }
    console.log(data);
    setStep((prev) => prev + 1);
    if (step === 3) {
      console.log("Złożono Zamówienie");
    }
  };

  return (
    <main className="flex flex-1 w-full justify-center bg-white dark:bg-black">
      <div className="flex flex-col w-9/12 m-10 items-center gap-9">
        <h1 className="text-3xl font-bold text-center">
          {step === 1
            ? "Dane Zamówienia"
            : step === 2
            ? "Opcje Wysyłki"
            : "Metoda Płatności"}
        </h1>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(submit)}
            className="flex flex-row gap-5 w-full"
          >
            {step === 1 ? (
              <UserData modified={methods.formState.isDirty} />
            ) : step === 2 ? (
              <DeliveryOptions />
            ) : (
              <Payment />
            )}
            <Summary step={step} setStep={setStep} />
          </form>
        </FormProvider>
      </div>
    </main>
  );
}
