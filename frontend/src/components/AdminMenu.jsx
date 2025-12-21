"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faGear,
  faPlus,
  faReceipt,
  faTags,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminMenu() {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header
      className={`relative h-auto bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden ${
        openMenu ? "w-60" : "w-20"
      }`}
      onMouseEnter={() => setOpenMenu(true)}
      onMouseLeave={() => setTimeout(() => setOpenMenu(false), 700)}
    >
      <div className="p-3 flex items-center gap-3">
        <Link href={"/"}>
          <Image src="/logo.png" alt="Logo" width={48} height={48} />
        </Link>
      </div>

      <div className="flex flex-col gap-3.5 p-4.5">
        <Link
          href={"/admin_panel"}
          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 text-white"
        >
          <FontAwesomeIcon icon={faChartColumn} className="w-5 h-5 shrink-0" />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Statystyki
          </span>
        </Link>
        <Link
          href={"/admin_panel/addProduct"}
          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 text-white"
        >
          <FontAwesomeIcon icon={faPlus} className="w-5 h-5 shrink-0" />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Dodaj Produkt
          </span>
        </Link>
        <Link
          href={"/admin_panel/orders"}
          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 text-white"
        >
          <FontAwesomeIcon icon={faReceipt} className="w-5 h-5 shrink-0" />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Zamówienia
          </span>
        </Link>
        <Link
          href={"/admin_panel/clients"}
          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 text-white"
        >
          <FontAwesomeIcon icon={faUsers} className="w-5 h-5 shrink-0" />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Klienci
          </span>
        </Link>
        <Link
          href={"/admin_panel/categories"}
          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 text-white"
        >
          <FontAwesomeIcon icon={faTags} className="w-5 h-5 shrink-0" />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Kategorie
          </span>
        </Link>
        <Link
          href={""}
          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 text-white"
        >
          <FontAwesomeIcon icon={faGear} className="w-5 h-5 shrink-0" />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden whitespace-nowrap origin-left transform ${
              openMenu
                ? "opacity-100 translate-x-0 max-w-[200px]"
                : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
            }`}
          >
            Ustawienia
          </span>
        </Link>
      </div>
    </header>
  );
}
