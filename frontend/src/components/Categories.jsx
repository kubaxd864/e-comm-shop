import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChild,
  faLaptop,
  faImage,
  faCompactDisc,
  faShirt,
  faCarSide,
  faBuildingColumns,
  faVolleyball,
  faCartShopping,
  faKitMedical,
  faFireExtinguisher,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function Categories() {
  const router = useRouter();
  const categories = [
    { id: 7, name: "Dom i Ogród", icon: faHouse, slug: "home" },
    { id: 8, name: "Dziecko", icon: faChild, slug: "kids" },
    { id: 1, name: "Elektronika", icon: faLaptop, slug: "electronics" },
    { id: 9, name: "Kolekcje i Sztuka", icon: faImage, slug: "arts" },
    {
      id: 10,
      name: "Kultura i Rozrywka",
      icon: faCompactDisc,
      slug: "culture",
    },
    { id: 5, name: "Moda", icon: faShirt, slug: "fashion" },
    { id: 17, name: "Motoryzacja", icon: faCarSide, slug: "cars" },
    {
      id: 11,
      name: "Nieruchomości",
      icon: faBuildingColumns,
      slug: "realestate",
    },
    { id: 12, name: "Sport i Rekreacja", icon: faVolleyball, slug: "sport" },
    { id: 14, name: "Uroda", icon: faFireExtinguisher, slug: "beauty" },
    { id: 15, name: "Zdrowie", icon: faKitMedical, slug: "health" },
    { id: 16, name: "Promocje", icon: faPercent, slug: "sales" },
  ];

  function searchByCategory(categoryId) {
    if (!categoryId) return;
    router.push(`/categories?category=${categoryId}`);
  }
  return (
    <div className="flex justify-center w-full px-4 py-4 bg-bg-primary border-b border-border">
      <div className="grid w-full max-w-[1700px] grid-cols-[repeat(auto-fit,minmax(105px,1fr))] gap-6 justify-items-center">
        {categories.map(({ id, name, icon }) => (
          <div
            key={id}
            onClick={() => searchByCategory(id)}
            className="flex flex-col items-center gap-2 text-center cursor-pointer max-w-[140px]"
          >
            <FontAwesomeIcon icon={icon} className="w-5 h-5 shrink-0" />
            <p className="text-sm truncate w-full">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
