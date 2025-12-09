import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/hooks/useCart";

export default function QuantityNumber({ value, productId }) {
  const { addToCart, lowerQuantity, refresh } = useCart();

  const handlePlus = async () => {
    await addToCart(productId);
    await refresh();
  };

  const handleMinus = async () => {
    await lowerQuantity(productId);
    await refresh();
  };

  return (
    <div className="flex rounded-lg p-2 items-center">
      <button
        onClick={handleMinus}
        disabled={Number(value) <= 1}
        className={`p-1 rounded ${
          Number(value) <= 1 ? "text-zinc-600" : "text-white cursor-pointer"
        }`}
      >
        <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={value}
        readOnly
        className="w-12 bg-transparent text-center border-none outline-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        className="p-1 rounded text-white cursor-pointer"
        onClick={handlePlus}
      >
        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
      </button>
    </div>
  );
}
