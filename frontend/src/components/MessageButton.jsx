import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/navigation";

export default function MsgButton({ type, id }) {
  const router = useRouter();
  return (
    <button
      className="p-3 bg-primary rounded hover:bg-primary-hover"
      onClick={() => router.push(`/messages?type=${type}&id=${id}`)}
    >
      <FontAwesomeIcon icon={faMessage} />
    </button>
  );
}
