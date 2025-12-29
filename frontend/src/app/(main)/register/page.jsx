"use client";
import axios from "axios";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useToast } from "@/components/ToastProvider";
import { useIsDark } from "@/hooks/useIsDark";

export default function Register() {
  const { addToast } = useToast();
  const isDark = useIsDark();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  async function onSubmit(data) {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        data,
        {
          withCredentials: true,
        }
      );
      addToast(res.data.message, "success");
      reset();
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd Serwera", "error");
    }
  }
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center">
      <div className="flex flex-col bg-bg-secondary items-center gap-6 text-center rounded-sm p-8 sm:p-16 m-10">
        <h2 className="text-3xl p-2">Zarejestruj Nowe Konto</h2>
        <form
          onSubmit={isSubmitSuccessful ? null : handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center gap-2"
        >
          <TextField
            id="email"
            label="E-mail"
            {...register("email", {
              required: "Email jest Wymagany",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Niepoprawny adres e-mail",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            variant="outlined"
            type="text"
            className="w-70 sm:w-104"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: isDark ? "#fff" : "#000",
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
              pattern: {
                value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/,
                message:
                  "Hasło musi zawierać małą i wielką literę, cyfrę i znak specjalny",
              },
            })}
            variant="outlined"
            type="password"
            className="w-70 sm:w-104"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: isDark ? "#fff" : "#000",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <TextField
            id="passwordConfirm"
            label="Powtórz Hasło"
            {...register("passwordConfirm", {
              required: "Powtórzenie jest wymagane",
              minLength: { value: 8, message: "Minimum 8 znaków" },
              validate: (value) =>
                value === getValues("password") || "Hasła nie są zgodne",
            })}
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
            variant="outlined"
            type="password"
            className="w-70 sm:w-104"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: isDark ? "#fff" : "#000",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <h3 className="text-3xl p-4">Dane użytkownika</h3>
          <TextField
            id="name"
            label="Imię i Nazwisko"
            {...register("name", {
              required: "Imię i Nazwisko jest Wymagane",
              minLength: { value: 6, message: "Za krótkie Imię i Nazwisko" },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            variant="outlined"
            type="text"
            className="w-70 sm:w-104"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: isDark ? "#fff" : "#000",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <TextField
            id="phone"
            label="Telefon"
            {...register("phone", {
              required: "Numer Telefonu jest Wymagany",
              minLength: { value: 9, message: "Za krótki Number Telefonu" },
              pattern: {
                value: /^\+?\d+$/,
                message: "Number Telefonu Zawiera Litery",
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            variant="outlined"
            type="text"
            className="w-70 sm:w-104"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: isDark ? "#fff" : "#000",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <FormControl>
            <InputLabel
              id="demo-simple-select-error-label"
              sx={{ color: "rgb(148 163 184)" }}
            >
              Województwo
            </InputLabel>
            <Controller
              name="state"
              control={control}
              defaultValue=""
              rules={{ required: "Województwo jest wymagane" }}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-70 sm:w-104"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: isDark ? "#0f172a" : "#f8fafc",
                        color: isDark ? "#f1f5f9" : "#0f172a",
                      },
                    },
                    MenuListProps: {
                      sx: {
                        "& .MuiMenuItem-root": {
                          bgcolor: "transparent",
                          "&:hover": {
                            bgcolor: isDark
                              ? "rgba(148, 163, 184, 0.1)"
                              : "rgba(15, 23, 42, 0.06)",
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiSelect-select": {
                      color: isDark ? "#f1f5f9" : "#0f172a",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Wybierz...</em>
                  </MenuItem>
                  <MenuItem value="zachodnio-pomostkie">
                    Zachodnio-Pomorskie
                  </MenuItem>
                  <MenuItem value={"pomorskie"}>Pomorskie</MenuItem>
                  <MenuItem value={"warmińsko-mazurskie"}>
                    Warmińsko-mazurskie
                  </MenuItem>
                  <MenuItem value={"podlaskie"}>Podlaskie</MenuItem>
                  <MenuItem value={"lubuskie"}>Lubelskie</MenuItem>
                  <MenuItem value={"wielkopolskie"}>Wielkopolskie</MenuItem>
                  <MenuItem value={"kujwawsko-pomorskie"}>
                    Kujwawsko-pomorskie
                  </MenuItem>
                  <MenuItem value={"mazowieckie"}>Mazowieckie</MenuItem>
                  <MenuItem value={"lubelskie"}>Lubelskie</MenuItem>
                  <MenuItem value={"dolnośląskie"}>Dolnośląskie</MenuItem>
                  <MenuItem value={"opolskie"}>Opolskie</MenuItem>
                  <MenuItem value={"łódzkie"}>Łódzkie</MenuItem>
                  <MenuItem value={"śląskie"}>Śląskie</MenuItem>
                  <MenuItem value={"świętokrzyskie"}>Świętokrzyskie</MenuItem>
                  <MenuItem value={"małopolskie"}>Małopolskie</MenuItem>
                  <MenuItem value={"podkarpackie"}>Podkarpackie</MenuItem>
                </Select>
              )}
            />
            {errors.state ? (
              <FormHelperText sx={{ color: "oklch(63.7% 0.237 25.331)" }}>
                {errors.state.message}
              </FormHelperText>
            ) : null}
          </FormControl>
          <div className="flex flex-col sm:flex-row gap-4 w-fit">
            <TextField
              id="post-code"
              label="Kod Pocztowy"
              {...register("postcode", {
                required: "Kod pocztowy jest wymagany",
                minLength: { value: 5, message: "Za krótki kod pocztowy" },
                pattern: {
                  value: /^(?:\d{2}-\d{3}|\d{5})$/,
                  message: "Niepoprawny format kodu",
                },
              })}
              error={!!errors.postcode}
              helperText={errors.postcode?.message}
              variant="outlined"
              type="text"
              className="w-70 sm:w-40"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgb(148 163 184)" },
                  "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                  "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                  color: isDark ? "#fff" : "#000",
                },
                "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
              }}
            />
            <TextField
              id="city"
              label="Miasto"
              {...register("city", {
                required: "Miasto jest Wymagane",
                minLength: { value: 2, message: "Za krótka nazwa miasta" },
              })}
              error={!!errors.city}
              helperText={errors.city?.message}
              variant="outlined"
              type="text"
              className="w-70 sm:w-60"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgb(148 163 184)" },
                  "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                  "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                  color: isDark ? "#fff" : "#000",
                },
                "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
              }}
            />
          </div>
          <TextField
            id="adress"
            label="Adres"
            {...register("address", {
              required: "Adres jest wymagany",
              minLength: { value: 8, message: "Za krótki adres zamieszkania" },
            })}
            error={!!errors.adress}
            helperText={errors.adress?.message}
            variant="outlined"
            type="text"
            className="w-70 sm:w-104"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgb(148 163 184)" },
                "&:hover fieldset": { borderColor: "rgb(148 163 184)" },
                "&.Mui-focused fieldset": { borderColor: "rgb(59 130 246)" },
                color: isDark ? "#fff" : "#000",
              },
              "& .MuiInputLabel-root": { color: "rgb(148 163 184)" },
            }}
          />
          <div className="flex flex-row gap-2 py-3">
            <Checkbox
              {...register("statute", {
                required: true,
              })}
              sx={{
                "& .MuiSvgIcon-root": { fontSize: 24 },
                color: "rgb(148 163 184)",
                padding: 0,
              }}
            />
            <label className="text-sm">
              Oświadczam, że znam i akceptuję postanowienia Regulaminu
            </label>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 p-3 w-full">
            <Link href={"/login"} className="w-full sm:w-1/2">
              <button
                type="button"
                className="w-full border border-gray-500 p-3 rounded-sm"
              >
                Zaloguj się
              </button>
            </Link>
            <button
              type="submit"
              className="w-full sm:w-1/2 bg-primary text-text-secondary p-3 rounded-sm cursor-pointer hover:bg-primary-hover"
            >
              {isSubmitSuccessful
                ? "Zarejestrowano"
                : isSubmitting
                ? "Rejestrowanie.."
                : "Zarejestruj Się"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
