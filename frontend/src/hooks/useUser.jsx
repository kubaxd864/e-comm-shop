"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:5000/api/me",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const user = data?.user ?? null;
  const role = user?.role ?? null;

  return {
    user,
    role,
    loading: isLoading,
    isAdmin: role === "admin" || role === "owner",
    isOwner: role === "owner",
    refreshUser: mutate,
    error,
  };
}
