"use client";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faBasketShopping,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { faStar, faUser } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useToast } from "./ToastProvider";
import ThemeToggle from "./ThemeSwitch";
import { useState, useRef } from "react";

export default function Header() {
  const { user, isAdmin, refreshUser } = useUser();
  const { addToast } = useToast();
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const nameInput = useRef(null);

  async function logout() {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      await refreshUser(null, { revalidate: false });
      addToast(res.data?.message, "success");
      router.push("/");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message, "error");
    }
  }

  function searchByName() {
    const name = nameInput.current?.value?.trim();
    if (!name) return;
    router.push(`/categories?name=${name}`);
  }

  return (
    <header className="flex justify-center w-full h-24 p-6 bg-bg-primary border-b border-b-border">
      <div className="flex flex-row justify-center items-center gap-8 w-full max-w-[1440px] mx-auto">
        <Link href={"/"}>
          <Image src="/logo.png" alt="Logo" width={90} height={90} />
        </Link>
        <div className="flex flex-row w-full h-10/12 border border-border rounded-lg">
          <input
            ref={nameInput}
            type="text"
            id="searchBar"
            onBlur={() => searchByName()}
            placeholder="Czego Szukasz?"
            className="w-full rounded-l-lg px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => searchByName()}
            className="py-2 px-4 rounded-r-lg bg-primary text-text-secondary hover:bg-primary-hover"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5" />
          </button>
        </div>
        <Link href={"/favorite"} className="hidden md:flex">
          <div className="flex flex-col justify-center items-center gap-3 h-full text-sm hover:cursor-pointer">
            <FontAwesomeIcon icon={faStar} className="w-5" />
            <p>Ulubione</p>
          </div>
        </Link>
        <Link href={"/basket"} className="hidden md:flex">
          <div className="flex flex-col justify-center items-center gap-3 h-full text-sm hover:cursor-pointer">
            <FontAwesomeIcon icon={faBasketShopping} className="w-5" />
            <p>Koszyk</p>
          </div>
        </Link>
        <div
          className="h-full text-sm text-nowrap hover:cursor-pointer relative hidden md:flex"
          onMouseEnter={() => setOpenMenu(true)}
          onMouseLeave={() => setTimeout(() => setOpenMenu(false), 3000)}
        >
          <Link href={user ? "/myaccount" : "/login"}>
            <div className="flex flex-col justify-center items-center gap-3">
              <FontAwesomeIcon icon={faUser} className="w-4" />
              <p>{user ? "Twoje Konto" : "Zaloguj się"}</p>
            </div>
          </Link>
          {user ? (
            <div
              className={`absolute right-0 top-full z-1000 mt-2 flex flex-col gap-5 rounded-sm border border-border bg-bg-primary p-3 text-left text-sm transition-all duration-200 ease-out origin-top transform ${
                openMenu
                  ? "scale-y-100 opacity-100 translate-y-0"
                  : "pointer-events-none scale-y-0 opacity-0 -translate-y-2"
              }`}
              onMouseEnter={() => setOpenMenu(true)}
              onMouseLeave={() => setTimeout(() => setOpenMenu(false), 3000)}
            >
              {" "}
              <div>
                <p className="font-bold">{user.email}</p>
                <p className="font-bold">id: {user.id}</p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="flex justify-center items-center">Tryb: </p>
                <ThemeToggle />
              </div>
              {isAdmin ? (
                <Link href={"/admin_panel"}>
                  <p>Panel Administratora</p>
                </Link>
              ) : null}
              <Link href={"/myaccount"}>
                <p>Moje Konto</p>
              </Link>
              <Link href={"myorders"}>
                <p>Moje Zamówienia</p>
              </Link>
              <p onClick={() => logout()}>Wyloguj się</p>
            </div>
          ) : null}
        </div>
        <div className="relative flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex items-center justify-center text-xl"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div
            className={`absolute right-0 top-full z-1000 mt-2 flex min-w-[200px] flex-col gap-5 rounded-sm border border-border bg-bg-primary p-3 text-left text-sm transition-all duration-200 ease-out origin-top transform ${
              mobileMenuOpen
                ? "scale-y-100 opacity-100 translate-y-0"
                : "pointer-events-none scale-y-0 opacity-0 -translate-y-2"
            }`}
          >
            {user ? (
              <>
                <div>
                  <p className="font-bold">{user.email}</p>
                  <p className="font-bold">id: {user.id}</p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="flex justify-center items-center">Tryb:</p>
                  <ThemeToggle />
                </div>
                {isAdmin ? (
                  <Link
                    href={"/admin_panel"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <p>Panel Administratora</p>
                  </Link>
                ) : null}
                <Link
                  href={"/favorite"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p>Ulubione</p>
                </Link>
                <Link href={"/basket"} onClick={() => setMobileMenuOpen(false)}>
                  <p>Koszyk</p>
                </Link>
                <Link
                  href={"/myaccount"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p>Moje Konto</p>
                </Link>
                <Link
                  href={"/myorders"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p>Moje Zamówienia</p>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-left"
                >
                  Wyloguj się
                </button>
              </>
            ) : (
              <>
                <Link href={"/login"} onClick={() => setMobileMenuOpen(false)}>
                  <p>Zaloguj się</p>
                </Link>
                <Link
                  href={"/register"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p>Zarejestruj się</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
