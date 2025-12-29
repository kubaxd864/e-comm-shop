"use client";
import { useState } from "react";
import { Checkbox } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { fetcher } from "@/lib/fetcher";
import { useForm } from "react-hook-form";
import axios from "axios";
import useSWR from "swr";

export default function Contact() {
  const searchParams = useSearchParams();
  const selectedshop = searchParams?.get("placowka") ?? null;
  const [status, setStatus] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const { data } = useSWR(`http://localhost:5000/api/get_stores`, fetcher);
  const shops = data?.stores ?? [];

  async function onSubmit(data) {
    try {
      const res = await axios.post("http://localhost:5000/api/contact", {
        ...data,
      });
      if (res.status === 200) {
        setStatus(res.data?.message);
        setTimeout(() => {
          reset();
          setStatus("");
        }, 5000);
      }
    } catch (err) {
      setStatus(err.response.data?.message);
      setTimeout(() => {
        reset();
        setStatus("");
      }, 5000);
    }
  }

  return (
    <main className="flex flex-1 flex-col w-full items-center p-10 ">
      <h1 className="text-3xl font-bold text-center mb-8">Kontakt do Nas</h1>
      <div className="flex flex-col w-full md:w-10/12 lg:w-8/12 bg-bg-secondary p-8 rounded-lg gap-3">
        <p>
          Jeśli masz pytania dotyczące zamówień, produktów lub działania serwisu
          – skontaktuj się z nami.
        </p>
        <p>Dane kontaktowe:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>E-mail: przykładowymail@twojadomena.pl</li>
          <li>Telefon: +48 000 000 000</li>
          <li>Godziny pracy: poniedziałek–piątek, 9:00–17:00</li>
        </ul>
        <p>
          Możesz również skorzystać z formularza kontaktowego dostępnego na
          stronie.
        </p>
        <div className="flex flex-col items-center gap-4 p-4">
          <h2 className="text-xl font-semibold">Formularz Kontaktowy</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-full lg:w-3/4 gap-3"
          >
            <div className="flex flex-col w-full gap-2">
              <input
                name="name"
                {...register("name", {
                  required: "Imię i Nazwisko jest wymagane",
                })}
                type="text"
                className={`flex w-full border border-border rounded-sm py-2 px-4 ${
                  errors.name ? "border-red-400" : null
                }`}
                placeholder="Imię i nazwisko"
              />
              {errors.name ? (
                <p className="text-red-400 text-sm">{errors.name?.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-2">
              <input
                name="email"
                {...register("email", {
                  required: "Email jest Wymagany",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Niepoprawny adres e-mail",
                  },
                })}
                type="text"
                className={`flex border border-border rounded-sm py-2 px-4 ${
                  errors.name ? "border-red-400" : null
                }`}
                placeholder="Email"
              />
              {errors.email ? (
                <p className="text-red-400 text-sm">{errors.email?.message}</p>
              ) : null}
            </div>
            {!selectedshop && (
              <div className="flex flex-col w-full gap-2">
                <select
                  name="shopId"
                  {...register("shopId", {
                    required: "Wybranie Sklepu jest wymagane",
                  })}
                  defaultValue=""
                  className={`appearance-none w-full border border-border rounded-sm py-2 px-4 pr-10 bg-bg_secondary text-gray-400 ${
                    errors.shopId ? "border-red-400" : null
                  }`}
                >
                  <option
                    value=""
                    className="bg-bg-secondary text-text-primary"
                  >
                    Wybierz placówkę do Kontaktu
                  </option>
                  {shops.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="bg-bg-secondary text-text-primary"
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.shopId ? (
                  <p className="text-red-400 text-sm">
                    {errors.shopId?.message}
                  </p>
                ) : null}
              </div>
            )}
            <div className="flex flex-col w-full gap-2">
              <input
                name="subject"
                {...register("subject", {
                  required: "Temat wiadomości jest wymagany",
                })}
                className={`flex border border-border rounded-sm py-2 px-4 ${
                  errors.subject ? "border-red-400" : null
                }`}
                placeholder="Temat wiadomości"
              />
              {errors.subject ? (
                <p className="text-red-400 text-sm">
                  {errors.subject?.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-2">
              <textarea
                name="message"
                {...register("message", {
                  required: "Nie można wysłać wiadomości bez treści",
                })}
                className={`flex border border-border rounded-sm py-2 px-4 ${
                  errors.message ? "border-red-400" : null
                }`}
                placeholder="Treść wiadomości"
              />
              {errors.message ? (
                <p className="text-red-400 text-sm">
                  {errors.message?.message}
                </p>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-sm py-2">
              <Checkbox
                {...register("save_data")}
                sx={{
                  "& .MuiSvgIcon-root": { fontSize: 24 },
                  color: "rgb(148 163 184)",
                  padding: 0,
                }}
              />
              Wyrażam zgodę na przetwarzanie moich danych osobowych w celu
              obsługi zapytania.
            </label>
            <div className="flex w-full justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-text-secondary py-3 px-12 w-fit rounded-sm cursor-pointer hover:bg-primary-hover"
              >
                {isSubmitting ? "Wysyłanie" : status !== "" ? status : "Wyślij"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
