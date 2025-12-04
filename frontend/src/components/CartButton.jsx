"use client";
export default function CartBtn() {
  return (
    <button
      className="bg-blue-800 px-5 py-2.5 rounded-sm cursor-pointer hover:bg-blue-700"
      onClick={() => console.log("Dodano do Koszyka")}
    >
      Do koszyka
    </button>
  );
}
