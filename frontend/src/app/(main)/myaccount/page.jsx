"use client";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/ToastProvider";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";
import axios from "axios";

export default function Myaccount() {
  const { user, refreshUser } = useUser();
  const { addToast } = useToast();
  const [edit, openEdit] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const getRules = (key) => {
    switch (key) {
      case "name":
        return {
          minLength: { value: 3, message: "Za krótkie Imię" },
        };
      case "surname":
        return {
          minLength: { value: 3, message: "Za krótkie Nazwisko" },
        };
      case "email":
        return {
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Niepoprawny adres e-mail",
          },
        };
      case "phone":
        return {
          minLength: { value: 9, message: "Za krótki Number Telefonu" },
          pattern: {
            value: /^\+?\d+$/,
            message: "Number Telefonu Zawiera Litery",
          },
        };
      case "county":
        return {
          minLength: { value: 7, message: "Za krótka Nazwa Województwa" },
        };
      case "postcode":
        return {
          minLength: { value: 5, message: "Za krótki kod pocztowy" },
          pattern: {
            value: /^(?:\d{2}-\d{3}|\d{5})$/,
            message: "Niepoprawny format kodu",
          },
        };
      case "city":
        return {
          minLength: { value: 2, message: "Za krótka nazwa miasta" },
        };
      case "adress":
        return {
          minLength: { value: 8, message: "Za krótki adres zamieszkania" },
        };
      default:
        return {};
    }
  };

  async function onSubmit(data) {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/user_update",
        { id: user.id, ...data },
        {
          withCredentials: true,
        }
      );
      addToast(res.data?.message ?? "Dane zaktualizowano", "success");
      reset(data);
      openEdit(false);
      await refreshUser();
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd serwera", "error");
    }
  }
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center gap-4 px-6 py-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full max-w-[700px] gap-8 bg-bg-secondary rounded-sm p-6 m-10"
      >
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-5 p-4">
            <p className="text-lg font-black">Podstawowe Dane użytkownika</p>
            <div className="flex flex-col gap-4">
              {user &&
                Object.entries(user)
                  .filter(([key]) => key !== "id" && key !== "role")
                  .map(([key, value]) => (
                    <div className="flex flex-col gap-1" key={key}>
                      <p className="text-sm capitalize">{key}</p>
                      {edit ? (
                        <>
                          <input
                            {...register(key, getRules(key) ?? {})}
                            type="text"
                            className="border border-gray-600 rounded-sm p-2"
                            defaultValue={value ?? ""}
                          />
                          {errors[key]?.message && (
                            <p className="text-sm text-red-400">
                              {errors[key].message}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{value}</p>
                      )}
                    </div>
                  ))}
            </div>
          </div>
          {!edit ? (
            <button
              type="button"
              onClick={() => openEdit(true)}
              className="flex flex-row h-fit p-4 gap-1 cursor-pointer hover:text-gray-300"
            >
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="p-0.75"
              ></FontAwesomeIcon>
              Edytuj
            </button>
          ) : null}
        </div>
        {edit ? (
          <div className="flex flex-row gap-4 p-2">
            <button
              type="button"
              className="border border-border px-6 py-3 rounded-sm"
              onClick={() => openEdit(false)}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="bg-primary text-text-secondary px-6 py-3 rounded-sm cursor-pointer hover:bg-primary-hover"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        ) : null}
      </form>
    </main>
  );
}
