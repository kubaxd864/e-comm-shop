import Image from "next/image";
import Link from "next/link";
import {
  faFacebook,
  faInstagram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <footer className="flex flex-col lg:flex-row justify-center gap-12 bg-bg-primary border-t border-t-border w-full p-8">
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
      <p className="max-w-[450px]">
        „Nasz sklep internetowy oferuje starannie wyselekcjonowane produkty
        wysokiej jakości. Stawiamy na szybką dostawę, profesjonalną obsługę oraz
        bezpieczne zakupy. Dziękujemy za zaufanie i życzymy udanych zakupów!”
      </p>
      <ul className="flex flex-col gap-0.5 cursor-pointer">
        <Link href={"/shops"}>Nasze Punkty</Link>
        <Link href={"/regulations"}>Regulamin</Link>
        <Link href={"privacy_policy"}>Polityka Prywatności</Link>
        <Link href={"/contact"}>Informacje Kontaktowe</Link>
      </ul>
      <div className="flex flex-row gap-3 items-end">
        <Link
          href={"https://www.facebook.com"}
          className="flex flex-col items-end"
        >
          <FontAwesomeIcon icon={faFacebook} className="text-gray-400 w-5" />
        </Link>
        <Link
          href={"https://www.instagram.com"}
          className="flex flex-col items-end"
        >
          <FontAwesomeIcon icon={faInstagram} className="text-gray-400 w-5" />
        </Link>
        <Link
          href={"https://www.tiktok.com/pl-PL/"}
          className="flex flex-col items-end"
        >
          <FontAwesomeIcon icon={faTiktok} className="text-gray-400 w-5" />
        </Link>
      </div>
    </footer>
  );
}
