"use client";
export default function CartBtn() {
  return (
    <button
      className="bg-blue-800 px-6 py-3 rounded-sm cursor-pointer hover:bg-blue-700"
      onClick={() => console.log("Dodano do Koszyka")}
    >
      Do koszyka
    </button>
  );
}
