"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserLock,
  faUser,
  faMagnifyingGlass,
  faUserPlus,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import axios from "axios";
import { fetcher } from "@/lib/fetcher";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/ToastProvider";

const statusStyles = {
  1: "bg-green-500/10 text-green-500",
  0: "bg-red-500/10 text-red-600",
};

const roleStyles = {
  owner: "bg-purple-500/10 text-purple-600",
  admin: "bg-yellow-500/10 text-yellow-600",
  user: "bg-blue-500/10 text-blue-600",
};

export default function Clients() {
  const [previewId, setPreviewId] = useState(null);
  const { user: currentUser, isOwner } = useUser();
  const { addToast } = useToast();
  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:5000/api/admin/users",
    fetcher
  );
  const users = data?.users ?? [];

  async function UpdateStatus(id) {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/update_user_status`,
        { id },
        { withCredentials: true }
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  async function UpdatePrivileges(id, role) {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/update_privilages`,
        { id, role },
        { withCredentials: true }
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }
  return (
    <div className="flex flex-1 w-full flex-col gap-8 items-center px-6 py-12">
      <div className="flex flex-row w-full md:w-11/12 lg:w-9/12 xl:w-8/12">
        <h1 className="text-3xl font-semibold">Użytkownicy</h1>
      </div>
      <div className="flex flex-col p-10 gap-6 w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-h-[630px] overflow-auto hide-scrollbar bg-bg-secondary rounded-lg">
        {isLoading ? (
          <p className="w-full text-center">Wczytywanie danych....</p>
        ) : error ? (
          <p className="w-full text-center">Błąd wczytywania danych</p>
        ) : (
          users.map((user, idx) => {
            const isPreview = previewId === user.id;
            return (
              <div
                key={idx}
                className="flex flex-col rounded border border-border bg-bg-secondary"
              >
                <div className="grid grid-cols-[60px_minmax(0,1.2fr)_minmax(0,1.6fr)_110px_110px_auto] items-center gap-4 p-4">
                  <p className="font-semibold text-sm">{user.id}</p>
                  <p className="text-sm truncate">
                    {user.name + " " + user.surname}
                  </p>
                  <p className="text-sm truncate">{user.email}</p>
                  <p
                    className={`px-3 py-1 rounded text-xs font-medium capitalize text-center ${
                      roleStyles[user.role]
                    }`}
                  >
                    {user.role}
                  </p>
                  <p
                    className={`px-3 py-1 rounded text-xs font-medium capitalize text-center ${
                      statusStyles[user.is_active]
                    }`}
                  >
                    {user.is_active ? "Aktywne" : "Zablokowane"}
                  </p>
                  <div className="flex justify-end gap-4 min-w-24">
                    <button
                      onClick={() =>
                        setPreviewId((prev) =>
                          prev === user.id ? null : user.id
                        )
                      }
                      className="text-sm cursor-pointer text-text-secondary"
                      aria-label="Podgląd"
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                    {user.role !== "owner" && user.id !== currentUser?.id ? (
                      <button
                        onClick={() => UpdateStatus(user.id)}
                        className="text-sm cursor-pointer text-text-secondary"
                        aria-label="Zmień status konta"
                      >
                        <FontAwesomeIcon
                          icon={user.is_active ? faUserLock : faUser}
                        />
                      </button>
                    ) : null}
                    {isOwner && user.role !== "owner" ? (
                      <button
                        onClick={() => UpdatePrivileges(user.id, user.role)}
                        className="text-sm cursor-pointer text-text-secondary"
                        aria-label="Zmień uprawnienia"
                      >
                        <FontAwesomeIcon
                          icon={user.role == "user" ? faUserPlus : faUserMinus}
                        />
                      </button>
                    ) : null}
                  </div>
                </div>
                {isPreview ? (
                  <div className="grid gap-3 px-4 pb-4 text-sm sm:grid-cols-2">
                    <div className="rounded border border-border/60 bg-bg-primary px-3 py-2">
                      <p className="text-xs uppercase text-text-tertiary">
                        Adres
                      </p>
                      <p className="mt-1 wrap-break-words">
                        {user.adress} {user.postcode} {user.city}
                      </p>
                    </div>
                    <div className="rounded border border-border/60 bg-bg-primary px-3 py-2">
                      <p className="text-xs uppercase text-text-tertiary">
                        Telefon
                      </p>
                      <p className="mt-1">{user.phone ?? "Brak danych"}</p>
                    </div>
                    <div className="rounded border border-border/60 bg-bg-primary px-3 py-2 sm:col-span-2">
                      <p className="text-xs uppercase text-text-tertiary">
                        Województwo
                      </p>
                      <p className="mt-1">{user.county ?? "Brak danych"}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
