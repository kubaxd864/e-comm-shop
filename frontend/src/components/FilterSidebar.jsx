import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function FilterSideBar({ categories, stores }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openFilters, setopenFilters] = useState(false);
  const sortTypeRef = useRef(null);
  const priceMinRef = useRef(null);
  const priceMaxRef = useRef(null);
  const conditionRef = useRef(null);
  const shopRef = useRef(null);
  const initialPathRef = useRef(pathname + `?${searchParams.toString()}`);

  function FilterResults(selectedCategoryId) {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ""
    );
    if (sortTypeRef.current) params.set("sort", sortTypeRef.current.value);
    else params.delete("sort");
    if (priceMinRef.current.value)
      params.set("priceMin", priceMinRef.current.value);
    else params.delete("priceMin");
    if (priceMaxRef.current.value)
      params.set("priceMax", priceMaxRef.current.value);
    else params.delete("priceMax");
    if (conditionRef.current.value !== "")
      params.set("condition", conditionRef.current.value);
    else params.delete("condition");
    if (shopRef.current.value !== "") params.set("shop", shopRef.current.value);
    else params.delete("shop");
    if (selectedCategoryId) {
      const currentCategory = params.get("category");
      if (currentCategory === String(selectedCategoryId)) {
        params.delete("category");
      } else {
        params.set("category", selectedCategoryId);
      }
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function ClearFilters() {
    if (sortTypeRef.current) sortTypeRef.current.value = "newest";
    if (priceMinRef.current) priceMinRef.current.value = "";
    if (priceMaxRef.current) priceMaxRef.current.value = "";
    if (conditionRef.current) conditionRef.current.value = "";
    if (shopRef.current) shopRef.current.value = "";

    router.push(initialPathRef.current);
  }

  return (
    <div className="w-full md:w-1/4 h-fit min-w-[300px] flex flex-col gap-6 bg-bg-secondary rounded-sm p-4 md:px-4 md:py-8">
      <div className="flex md:hidden flex-row justify-between">
        <p className="text-2xl">Filtry</p>
        <button onClick={() => setopenFilters((prev) => !prev)}>
          <FontAwesomeIcon
            icon={faBars}
            className="items-center justify-center text-xl"
          />
        </button>
      </div>
      <div
        className={`flex-col gap-6 ${openFilters ? "flex" : "hidden"} md:flex`}
      >
        <h1 className="text-2xl">Sortowanie</h1>
        <div className="relative">
          <select
            name="condition"
            defaultValue="newest"
            onChange={() => FilterResults()}
            ref={sortTypeRef}
            className="appearance-none w-full border border-border rounded-sm py-2 px-4 pr-10 text-gray-400"
          >
            <option
              value="newest"
              className="bg-bg-secondary text-text-primary"
            >
              Data dodania: Najnowsze
            </option>
            <option
              value="oldest"
              className="bg-bg-secondary text-text-primary"
            >
              Data dodania: Najstarsze
            </option>
            <option
              value="price_asc"
              className="bg-bg-secondary text-text-primary"
            >
              Cena od: Najniższej
            </option>
            <option
              value="price_desc"
              className="bg-bg-secondary text-text-primary"
            >
              Cena od: Najwyższej
            </option>
            <option
              value="name_asc"
              className="bg-bg-secondary text-text-primary"
            >
              Nazwa od: A-Z
            </option>
            <option
              value="name_desc"
              className="bg-bg-secondary text-text-primary"
            >
              Nazwa od: Z-A
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="w-4 h-4 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {categories.length !== 0 ? (
          <>
            <h1 className="text-2xl">Podkategorie</h1>
            <div className="flex flex-col gap-2">
              {categories?.map((category, idx) => (
                <div
                  key={idx}
                  onClick={() => FilterResults(category.id)}
                  className="flex flex-row justify-between w-full cursor-pointer"
                >
                  {category.name}
                  <span>{category.productCount}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
        <h1 className="text-2xl">Filtry</h1>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label>Cena</label>
            <div className="flex flex-row gap-3">
              <input
                type="number"
                placeholder="od"
                onBlur={() => FilterResults()}
                ref={priceMinRef}
                className="flex w-1/2 border border-border rounded-sm py-2 px-4"
              ></input>
              <input
                type="number"
                placeholder="do"
                onBlur={() => FilterResults()}
                ref={priceMaxRef}
                className="flex w-1/2 border border-border rounded-sm py-2 px-4"
              ></input>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label>Stan</label>
            <div className="relative">
              <select
                name="condition"
                onChange={() => FilterResults()}
                ref={conditionRef}
                defaultValue=""
                className="appearance-none w-full border border-border rounded-sm py-2 px-4 pr-10 text-gray-400"
              >
                <option
                  value=""
                  disabled
                  className="bg-bg-secondary text-text-primary"
                >
                  Stan...
                </option>
                <option
                  value="Nowe"
                  className="bg-bg-secondary text-text-primary"
                >
                  Nowe
                </option>
                <option
                  value="Używane"
                  className="bg-bg-secondary text-text-primary"
                >
                  Używane
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label>Sklep</label>
            <div className="relative">
              <select
                name="condition"
                onChange={() => FilterResults()}
                ref={shopRef}
                defaultValue=""
                className="appearance-none w-full border border-border rounded-sm py-2 px-4 pr-10 text-gray-400"
              >
                <option
                  value=""
                  disabled
                  className="bg-bg-secondary text-text-primary"
                >
                  Sklep...
                </option>
                {stores.map((store) => (
                  <option
                    key={store.id}
                    value={store.id}
                    className="bg-bg-secondary text-text-primary"
                  >
                    {store.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => ClearFilters()}
          className="bg-primary text-text-secondary px-1.5 py-3.5 rounded-sm cursor-pointer hover:bg-primary-hover"
        >
          Wyczyść Filtry
        </button>
      </div>
    </div>
  );
}
