"use client";
import axios from "axios";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { TextField, Checkbox } from "@mui/material";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useUser } from "@/components/UserProvider";

export default function Login() {
  const { addToast } = useToast();
  const router = useRouter();
  const { refreshUser } = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  async function onSubmit(data) {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data,
        {
          withCredentials: true,
        }
      );

      addToast(res.data?.message, "success");
      await refreshUser();
      reset();
      router.push("/");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd Serwera", "error");
    }
  }
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col bg-zinc-950 items-center gap-6 text-center rounded-sm p-16 m-10">
        <h2 className="text-3xl p-2">Zaloguj Się do Konta</h2>
        <form
          onSubmit={isSubmitSuccessful ? null : handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <TextField
            id="email"
            label="E-mail"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email", {
              required: "Email jest Wymagany",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Niepoprawny adres e-mail",
              },
            })}
            variant="outlined"
            type="text"
            className="w-80"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: "white",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <TextField
            id="password"
            label="Hasło"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password", {
              required: "Hasło jest wymagane",
              minLength: { value: 8, message: "Minimum 8 znaków" },
            })}
            variant="outlined"
            type="password"
            className="w-80"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: "white",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <div className="flex flex-row gap-2 py-3">
            <Checkbox
              {...register("remember_me")}
              sx={{
                "& .MuiSvgIcon-root": { fontSize: 24 },
                color: "rgb(148 163 184)",
                padding: 0,
              }}
            />
            <label>Zapamiętaj Mnie</label>
          </div>
          <p className="flex text-blue-500 pb-2 hover:underline">
            <Link href={"/password_reset"}>Zapomniałeś Hasła?</Link>
          </p>
          <div className="flex flex-row justify-center items-center gap-3 p-3">
            <Link href={"/register"}>
              <button
                type="button"
                className="border border-gray-500 px-6 py-3 rounded-sm"
              >
                Zarejestruj Się
              </button>
            </Link>
            <button type="submit" className="bg-blue-800 px-6 py-3 rounded-sm">
              {isSubmitting ? "Logowanie.. " : "Zaloguj Się"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
