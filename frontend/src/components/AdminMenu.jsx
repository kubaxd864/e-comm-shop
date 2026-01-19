"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeSwitch";
import axios from "axios";
import { useToast } from "./ToastProvider";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faGear,
  faReceipt,
  faTags,
  faChartColumn,
  faBoxesStacked,
  faRightFromBracket,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminMenu() {
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { addToast } = useToast();
  const { refreshUser } = useUser();
  const router = useRouter();
  const menuItems = [
    { link: "/admin_panel", icon: faChartColumn, title: "Statystyki" },
    { link: "/admin_panel/products", icon: faBoxesStacked, title: "Produkty" },
    { link: "/admin_panel/orders", icon: faReceipt, title: "Zamówienia" },
    { link: "/admin_panel/clients", icon: faUsers, title: "Klienci" },
    { link: "/admin_panel/categories", icon: faTags, title: "Kategorie" },
    { link: "/admin_panel/messages", icon: faMessage, title: "Wiadomości" },
    { link: "", icon: faGear, title: "Ustawienia" },
  ];

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && openMenu) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenMenu(false);
    }
  }, [isMobile, openMenu]);

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

  return (
    <header
      className={`sticky top-0 flex flex-col h-screen shrink-0 bg-bg-secondary transition-all duration-300 ease-in-out overflow-hidden ${
        !isMobile && openMenu ? "w-60" : "w-20"
      }`}
      onMouseEnter={() => {
        if (!isMobile) {
          setOpenMenu(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setTimeout(() => setOpenMenu(false), 1000);
        }
      }}
    >
      <div className="p-3 flex items-center gap-3">
        <Link href={"/"}>
          <Image src="/logo.png" alt="Logo" width={48} height={48} />
        </Link>
      </div>
      <div className="flex flex-col gap-3.5 p-4.5">
        {menuItems.map((e, idx) => (
          <Link
            key={idx}
            href={e.link}
            className="flex items-center gap-3 p-2 rounded text-text-primary"
          >
            <FontAwesomeIcon icon={e.icon} className="w-5 h-5 shrink-0" />
            <span
              className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
                !isMobile && openMenu
                  ? "opacity-100 translate-x-0 max-w-[200px]"
                  : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
              }`}
            >
              {e.title}
            </span>
          </Link>
        ))}
        <div
          onClick={() => logout()}
          className="flex items-center gap-3 p-2 rounded text-text-primary"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="w-5 h-5 shrink-0"
          />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              !isMobile && openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Wyloguj się
          </span>
        </div>
      </div>
      <div className="flex flex-row gap-3 px-1.5">
        <ThemeToggle />
        <span
          className={`flex items-center justify-center transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
            !isMobile && openMenu
              ? "opacity-100 translate-x-0 max-w-[200px]"
              : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
          }`}
        >
          Tryb
        </span>
      </div>
    </header>
  );
}
