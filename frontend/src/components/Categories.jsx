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
import Link from "next/link";

export default function Categories() {
  const categories = [
    { name: "Dom i Ogród", icon: faHouse, slug: "home" },
    { name: "Dziecko", icon: faChild, slug: "kids" },
    { name: "Elektronika", icon: faLaptop, slug: "electronics" },
    { name: "Kolekcje i Sztuka", icon: faImage, slug: "arts" },
    { name: "Kultura i Rozrywka", icon: faCompactDisc, slug: "culture" },
    { name: "Moda", icon: faShirt, slug: "fashion" },
    { name: "Motoryzacja", icon: faCarSide, slug: "cars" },
    { name: "Nieruchomości", icon: faBuildingColumns, slug: "realestate" },
    { name: "Sport i Rekreacja", icon: faVolleyball, slug: "sport" },
    { name: "SuperMarket", icon: faCartShopping, slug: "supermarket" },
    { name: "Uroda", icon: faFireExtinguisher, slug: "beauty" },
    { name: "Zdrowie", icon: faKitMedical, slug: "health" },
    { name: "Promocje", icon: faPercent, slug: "sales" },
  ];
  return (
    <div className="flex justify-center w-full h-20 p-2 bg-zinc-950 border-t border-b border-t-gray-700 border-b-gray-700">
      <div className="flex flex-row gap-9">
        {categories.map(({ name, icon, slug }) => (
          <Link
            key={slug}
            href={`/categories/${slug}`}
            className="flex flex-col items-center justify-center gap-2 text-center"
          >
            <FontAwesomeIcon icon={icon} className="h-5! w-5!" />
            <p className="text-sm">{name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
