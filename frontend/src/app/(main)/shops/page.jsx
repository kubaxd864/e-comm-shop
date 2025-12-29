"use client";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/fetcher";

export default function Shops() {
  const router = useRouter();
  const { data } = useSWR(`http://localhost:5000/api/get_stores`, fetcher);
  const shops = data?.stores ?? [];
  return (
    <main className="flex flex-1 flex-col w-full items-center p-10">
      <h1 className="text-3xl font-bold text-center">Nasze Placówki</h1>
      <div className="flex flex-col w-full items-center p-8 rounded-lg gap-14">
        <div className="flex flex-row flex-wrap justify-center gap-6 w-full">
          {shops.map((shop, idx) => (
            <div
              key={idx}
              className="w-[300px] flex flex-col gap-4 items-center p-4 bg-bg-secondary rounded-md"
            >
              <div className="relative w-full h-40">
                <Image
                  src={shop.photo}
                  alt="Miniatura"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-xl font-semibold">{shop.name}</h1>
                <p>Adres: {shop.address + " " + shop.city}</p>
                <p>Email: {shop.email}</p>
                <p>Telefon: {shop.phone}</p>
              </div>
              <button
                onClick={() => router.push(`/contact?placowka=${shop.id}`)}
                className="bg-primary text-text-secondary p-3 rounded-sm mt-auto cursor-pointer hover:bg-primary-hover"
              >
                Kontakt do Sklepu
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full max-w-3xl gap-4 text-left justify-center items-center">
          <h1 className="text-2xl font-bold">Znajdź nas w swojej okolicy</h1>
          <p className="text-gray-300">
            Sprawdź, gdzie możesz odwiedzić nasze punkty stacjonarne
          </p>
          <div className="relative w-full aspect-video">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9468.99819057697!2d19.403199166734897!3d54.15828328283835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46fd4c5d1807d04d%3A0x8e4d555df90aa9f3!2sStudnia%20Smak%C3%B3w!5e1!3m2!1spl!2spl!4v1766083415651!5m2!1spl!2spl"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
