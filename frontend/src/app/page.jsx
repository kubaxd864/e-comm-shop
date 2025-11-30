"use client";
import { useUser } from "@/components/UserProvider";
import Categories from "@/components/Categories";

export default function Home() {
  const { user, loading } = useUser();

  return (
    <main className="flex flex-1 w-full flex-col gap-8 bg-white text-center dark:bg-black">
      <Categories />
      {loading ? (
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Wczytywanie Produktów...
        </p>
      ) : (
        <>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Wybrane Dla Ciebie
          </h1>
          <div className="w-full bg-amber-800">
            <p>Produkt</p>
          </div>
        </>
      )}
    </main>
  );
}
