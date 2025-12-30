"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "./ToastProvider";

export default function PasswordForm() {
  const { addToast } = useToast();
  const [passwordchange, passwordEdit] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  async function changePasswd(data) {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/change_password",
        { ...data },
        {
          withCredentials: true,
        }
      );
      addToast(res.data?.message ?? "Hasło zmienione", "success");
      reset({ oldpassword: "", newpassword: "", newpasswordconfirm: "" });
      passwordEdit(false);
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd serwera", "error");
    }
  }
  return (
    <form
      onSubmit={handleSubmit(changePasswd)}
      className="flex flex-row w-full max-w-[700px] justify-between gap-8 bg-bg-secondary rounded-sm p-6 px-10 m-10 mt-0"
    >
      <div className="flex flex-col gap-2">
        <p className="text-lg font-black">Hasło</p>
        <p className="text-sm capitalize">Aktualne Hasło</p>
        {passwordchange ? (
          <>
            <input
              name="oldpassword"
              {...register("oldpassword", {
                required: "Aktualne hasło jest wymagane",
              })}
              type="password"
              className="border border-gray-600 rounded-sm p-2"
            />
            {errors.oldpassword?.message && (
              <p className="text-sm text-red-400">
                {errors.oldpassword.message}
              </p>
            )}
          </>
        ) : (
          <p>**********</p>
        )}
        {passwordchange ? (
          <>
            <p className="text-sm capitalize">Nowe hasło</p>
            <input
              name="newpassword"
              {...register("newpassword", {
                required: "Nowe hasło jest wymagane",
                minLength: { value: 8, message: "Minimum 8 znaków" },
                pattern: {
                  value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/,
                  message:
                    "Hasło musi zawierać małą i wielką literę, cyfrę i znak specjalny",
                },
              })}
              type="password"
              className="border border-gray-600 rounded-sm p-2"
            />
            {errors.newpassword?.message && (
              <p className="text-sm text-red-400">
                {errors.newpassword.message}
              </p>
            )}
            <p className="text-sm capitalize">Powtórz nowe hasło</p>
            <input
              name="newpasswordconfirm"
              {...register("newpasswordconfirm", {
                required: "Powtórzenie jest wymagane",
                minLength: { value: 8, message: "Minimum 8 znaków" },
                validate: (value) =>
                  value === getValues("newpassword") || "Hasła nie są zgodne",
              })}
              type="password"
              className="border border-gray-600 rounded-sm p-2"
            />
            {errors.newpasswordconfirm?.message && (
              <p className="text-sm text-red-400">
                {errors.newpasswordconfirm.message}
              </p>
            )}
            <div className="flex flex-row gap-4 pt-4">
              <button
                type="button"
                className="border border-border px-6 py-3 rounded-sm"
                onClick={() => passwordEdit(false)}
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
          </>
        ) : null}
      </div>
      {!passwordchange ? (
        <button
          type="button"
          onClick={() => passwordEdit((prev) => !prev)}
          className="flex flex-row h-fit gap-1 cursor-pointer hover:text-gray-300"
        >
          <FontAwesomeIcon icon={faKey} className="p-0.75"></FontAwesomeIcon>
          <span className="hidden sm:flex">Zmień hasło</span>
        </button>
      ) : null}
    </form>
  );
}
