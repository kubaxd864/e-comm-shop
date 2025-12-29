"use client";
import { Checkbox } from "@mui/material";
import { useUser } from "@/hooks/useUser";
import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";

export default function UserData({ modified }) {
  const { user } = useUser();
  const [invoice, setInvoice] = useState(false);
  const { register, unregister, setValue, formState } = useFormContext();
  useEffect(() => {
    const saved = sessionStorage.getItem("checkoutData");
    if (saved) {
      const data = JSON.parse(saved);
      setValue("name", data.name);
      setValue("surname", data.surname);
      setValue("adress", data.adress);
      setValue("postcode", data.postcode);
      setValue("city", data.city);
      setValue("email", data.email);
      setValue("phone", data.phone);
      if (data.invoice) {
        setValue("company_name", data.company_name);
        setValue("nip_number", data.nip_number);
        setValue("company_address", data.company_address);
        setValue("country", data.company_city);
        setValue("company_postcode", data.company_postcode);
        setValue("company_city", data.company_city);
      }
    }
    if (user && !saved) {
      setValue("name", user.name);
      setValue("surname", user.surname);
      setValue("adress", user.adress);
      setValue("postcode", user.postcode);
      setValue("city", user.city);
      setValue("email", user.email);
      setValue("phone", user.phone);
    }
  }, [user, setValue, unregister]);

  useEffect(() => {
    if (!invoice) {
      unregister([
        "company_name",
        "nip_number",
        "company_address",
        "country",
        "company_postcode",
        "company_city",
      ]);
    }
  }, [invoice, unregister]);

  return (
    <div className="flex flex-col gap-3 p-8 bg-bg-secondary rounded-sm w-full lg:wadw-3/4">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col w-full md:w-1/2 gap-1">
          <input
            {...register("name", {
              required: "To pole jest wymagane",
              minLength: { value: 3, message: "Za krótkie Imię" },
            })}
            name="name"
            type="text"
            placeholder="Imie*"
            className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
              formState.errors.name ? "border-red-400" : null
            }`}
          ></input>
          <label className="text-red-400 text-sm">
            {formState.errors.name?.message}
          </label>
        </div>
        <div className="flex flex-col w-full md:w-1/2 gap-1">
          <input
            {...register("surname", {
              required: "To pole jest wymagane",
              minLength: { value: 3, message: "Za krótkie Nazwisko" },
            })}
            name="surname"
            type="text"
            placeholder="Nazwisko*"
            className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
              formState.errors.surname ? "border-red-400" : null
            }`}
          ></input>
          <label className="text-red-400 text-sm">
            {formState.errors.surname?.message}
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full">
        <input
          {...register("adress", {
            required: "To pole jest wymagane",
            minLength: { value: 8, message: "Za krótki adres zamieszkania" },
          })}
          name="address"
          type="text"
          placeholder="Adres*"
          className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
            formState.errors.address ? "border-red-400" : null
          }`}
        ></input>
        <label className="text-red-400 text-sm">
          {formState.errors.address?.message}
        </label>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-1 w-full md:w-1/4">
          <input
            {...register("postcode", {
              required: "To pole jest wymagane",
              minLength: { value: 5, message: "Za krótki kod pocztowy" },
              pattern: {
                value: /^(?:\d{2}-\d{3}|\d{5})$/,
                message: "Niepoprawny format kodu",
              },
            })}
            name="postcode"
            type="text"
            placeholder="Kod Pocztowy*"
            className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
              formState.errors.postcode ? "border-red-400" : null
            }`}
          ></input>
          <label className="text-red-400 text-sm">
            {formState.errors.postcode?.message}
          </label>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-3/4">
          <input
            {...register("city", {
              required: "To pole jest wymagane",
              minLength: { value: 2, message: "Za krótka nazwa miasta" },
            })}
            name="city"
            type="text"
            placeholder="Miejscowość*"
            className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
              formState.errors.city ? "border-red-400" : null
            }`}
          ></input>
          <label className="text-red-400 text-sm">
            {formState.errors.city?.message}
          </label>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <input
            {...register("email", {
              required: "To pole jest wymagane",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Niepoprawny adres e-mail",
              },
            })}
            name="email"
            type="text"
            placeholder="E-mail*"
            className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
              formState.errors.email ? "border-red-400" : null
            }`}
          ></input>
          <label className="text-red-400 text-sm">
            {formState.errors.email?.message}
          </label>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <input
            {...register("phone", {
              required: "To pole jest wymagane",
              minLength: { value: 9, message: "Za krótki Number Telefonu" },
              pattern: {
                value: /^\+?\d+$/,
                message: "Number Telefonu Zawiera Litery",
              },
            })}
            name="phone"
            type="text"
            placeholder="Nr Telefon*"
            className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
              formState.errors.phone ? "border-red-400" : null
            }`}
          ></input>{" "}
          <label className="text-red-400 text-sm">
            {formState.errors.phone?.message}
          </label>
        </div>
      </div>
      {modified ? (
        <div className="flex flex-row gap-2">
          <Checkbox
            {...register("save_data")}
            sx={{
              "& .MuiSvgIcon-root": { fontSize: 24 },
              color: "rgb(148 163 184)",
              padding: 0,
            }}
          />
          <label>Zmodyfikuj moje dane do przyszłych transakcji</label>
        </div>
      ) : null}
      <div className="flex flex-row gap-2">
        <Checkbox
          {...register("invoice")}
          onChange={() => setInvoice((prev) => !prev)}
          sx={{
            "& .MuiSvgIcon-root": { fontSize: 24 },
            color: "rgb(148 163 184)",
            padding: 0,
          }}
        />
        <label>Chcę otrzymać fakturę</label>
      </div>
      {invoice ? (
        <div className="flex flex-col gap-5 pt-5">
          <h2 className="text-xl">Dane do Faktury</h2>
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-col gap-1 w-full md:w-3/4">
              <input
                {...register("company_name", {
                  required: "To pole jest wymagane",
                  minLength: { value: 3, message: "Za krótka nazwa firmy" },
                })}
                name="company_name"
                type="text"
                placeholder="Firma*"
                className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
                  formState.errors.company_name ? "border-red-400" : null
                }`}
              ></input>
              <label className="text-red-400 text-sm">
                {formState.errors.company_name?.message}
              </label>
            </div>
            <div className="flex flex-col gap-1 w-full md:w-1/4">
              <input
                {...register("nip_number", {
                  required: "To pole jest wymagane",
                  minLength: {
                    value: 10,
                    message: "Number NIP musi mieć 10 znaków",
                  },
                  maxLength: {
                    value: 10,
                    message: "Number NIP musi mieć 10 znaków",
                  },
                })}
                name="nip_number"
                type="text"
                placeholder="NIP*"
                className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
                  formState.errors.nip_number ? "border-red-400" : null
                }`}
              ></input>
              <label className="text-red-400 text-sm">
                {formState.errors.nip_number?.message}
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <input
              {...register("company_address", {
                required: "To pole jest wymagane",
                minLength: { value: 8, message: "Za krótki adres Firmy" },
              })}
              name="company_address"
              type="text"
              placeholder="Adres*"
              className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
                formState.errors.company_address ? "border-red-400" : null
              }`}
            ></input>
            <label className="text-red-400 text-sm">
              {formState.errors.company_address?.message}
            </label>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <input
              {...register("country", {
                required: "To pole jest wymagane",
                minLength: { value: 4, message: "Za krótka nazwa kraju" },
              })}
              name="country"
              type="text"
              placeholder="Kraj*"
              className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
                formState.errors.country ? "border-red-400" : null
              }`}
            ></input>
            <label className="text-red-400 text-sm">
              {formState.errors.country?.message}
            </label>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-col gap-1 w-full md:w-1/4">
              <input
                {...register("company_postcode", {
                  required: "To pole jest wymagane",
                  minLength: { value: 5, message: "Za krótki kod pocztowy" },
                  pattern: {
                    value: /^(?:\d{2}-\d{3}|\d{5})$/,
                    message: "Niepoprawny format kodu",
                  },
                })}
                name="company_postcode"
                type="text"
                placeholder="Kod Pocztowy*"
                className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
                  formState.errors.company_postcode ? "border-red-400" : null
                }`}
              ></input>
              <label className="text-red-400 text-sm">
                {formState.errors.company_postcode?.message}
              </label>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <input
                {...register("company_city", {
                  required: "To pole jest wymagane",
                  minLength: { value: 2, message: "Za krótka nazwa miasta" },
                })}
                name="company_city"
                type="text"
                placeholder="Miejscowość*"
                className={`w-full border-[1.5px] border-border px-2 py-3 rounded-sm ${
                  formState.errors.company_city ? "border-red-400" : null
                }`}
              ></input>
              <label className="text-red-400 text-sm">
                {formState.errors.company_city?.message}
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
