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
        "http://localhost:5000/api/admin/update_user_status",
        { id },
        { withCredentials: true }
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  async function UpdatePrivileges(id, role) {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/admin/update_privilages",
        { id, role },
        { withCredentials: true }
      );
      mutate();
      addToast(res.data.message, "info");
    } catch (err) {
      addToast(err.response?.data?.message ?? "Błąd", "error");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-4 py-10">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-semibold">Użytkownicy</h1>
      </div>
      <div className="w-full max-w-6xl rounded-lg bg-bg-secondary p-4 sm:p-6 overflow-auto max-h-[85vh] hide-scrollbar">
        {isLoading ? (
          <p className="text-center">Wczytywanie danych…</p>
        ) : error ? (
          <p className="text-center">Błąd wczytywania danych</p>
        ) : (
          <div className="flex flex-col gap-4">
            {users.map((user) => {
              const isPreview = previewId === user.id;
              return (
                <div
                  key={user.id}
                  className="rounded border border-border bg-bg-secondary"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_auto] items-center gap-4 p-4">
                    <span className="text-sm text-center font-semibold">
                      {user.id}
                    </span>
                    <span className="text-sm text-center truncate">
                      {user.name} {user.surname}
                    </span>
                    <span className="text-sm text-center truncate">
                      {user.email}
                    </span>
                    <div className="flex flex-wrap justify-center md:justify-end items-center gap-4">
                      <span
                        className={`h-fit px-3 py-1 rounded text-xs font-medium capitalize ${
                          roleStyles[user.role]
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`h-fit px-3 py-1 rounded text-xs font-medium capitalize ${
                          statusStyles[user.is_active]
                        }`}
                      >
                        {user.is_active ? "Aktywne" : "Zablokowane"}
                      </span>
                      <div className="flex gap-6 md:min-w-28">
                        <button
                          onClick={() =>
                            setPreviewId((prev) =>
                              prev === user.id ? null : user.id
                            )
                          }
                          className="text-text-secondary hover:text-primary cursor-pointer ml-auto"
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                        {user.role !== "owner" &&
                          user.id !== currentUser?.id && (
                            <button
                              onClick={() => UpdateStatus(user.id)}
                              className="text-text-secondary hover:text-primary cursor-pointer"
                            >
                              <FontAwesomeIcon
                                icon={user.is_active ? faUserLock : faUser}
                              />
                            </button>
                          )}
                        {isOwner && user.role !== "owner" && (
                          <button
                            onClick={() => UpdatePrivileges(user.id, user.role)}
                            className="text-text-secondary hover:text-primary cursor-pointer"
                          >
                            <FontAwesomeIcon
                              icon={
                                user.role === "user" ? faUserPlus : faUserMinus
                              }
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isPreview && (
                    <div className="grid gap-3 px-4 pb-4 text-sm sm:grid-cols-2">
                      <div className="rounded border border-border/60 bg-bg-primary px-3 py-2">
                        <p className="text-xs uppercase text-text-tertiary">
                          Adres
                        </p>
                        <p className="mt-1 break-words">
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
