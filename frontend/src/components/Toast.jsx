import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div
      className={`${
        type == "success"
          ? "bg-green-400"
          : type == "error"
          ? "bg-red-500"
          : type == "info"
          ? "bg-blue-500"
          : type == "warning"
          ? "bg-amber-300"
          : "bg-gray-500"
      } text-black px-4 py-2 rounded shadow-md flex items-center gap-3`}
    >
      <div className="flex-1">{message}</div>
      {onClose && (
        <button className="text-sm font-bold px-2" onClick={() => onClose()}>
          ×
        </button>
      )}
    </div>
  );
}
