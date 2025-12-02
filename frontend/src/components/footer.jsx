import Image from "next/image";
import {
  faFacebook,
  faInstagram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <footer className="flex flex-row justify-center gap-12 bg-zinc-950 w-full h-40 p-8">
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
      <p className="max-w-[450px]">
        „Nasz sklep internetowy oferuje starannie wyselekcjonowane produkty
        wysokiej jakości. Stawiamy na szybką dostawę, profesjonalną obsługę oraz
        bezpieczne zakupy. Dziękujemy za zaufanie i życzymy udanych zakupów!”
      </p>
      <ul className="flex flex-col gap-0.5">
        <li>Nasze Punkty</li>
        <li>Regulamin</li>
        <li>Polityka Prywatności</li>
        <li>Informacje Kontaktowe</li>
      </ul>
      <div className="flex flex-row gap-3 items-end">
        <FontAwesomeIcon icon={faFacebook} className="text-gray-400 w-5" />
        <FontAwesomeIcon icon={faInstagram} className="text-gray-400 w-5" />
        <FontAwesomeIcon icon={faTiktok} className="text-gray-400 w-5" />
      </div>
    </footer>
  );
}
