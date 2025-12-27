import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "./ToastProvider";

export default function ImageUploader({ images, setImages }) {
  const [dragged, setDragged] = useState(null);
  const { addToast } = useToast();
  const inputRef = useRef(null);

  const handleFiles = ({ target }) => {
    const files = Array.from(target.files || []);
    if (!files.length) return;

    const validTypes = ["image/jpeg", "image/png"];

    const newImages = files
      .map((file) => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`Plik ${file.name} > 5 MB`);
          return null;
        }
        if (!validTypes.includes(file.type)) {
          alert(`Niepoprawny format: ${file.name}`);
          return null;
        }

        return {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file,
        };
      })
      .filter(Boolean);

    setImages((prev) => {
      const merged = [...prev, ...newImages];
      return merged.map((m, idx) => ({ ...m, isMain: idx === 0 }));
    });
    target.value = "";
  };

  const removeImage = (id) =>
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      return filtered.map((m, idx) => ({ ...m, isMain: idx === 0 }));
    });

  const moveImage = (index) =>
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(dragged, 1);
      copy.splice(index, 0, item);
      return copy.map((m, idx) => ({ ...m, isMain: idx === 0 }));
    });

  return (
    <div className="flex flex-col gap-5 p-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Zdjęcia</h2>
        <p className="text-sm text-gray-400">
          Pierwsze zdjęcie jest główne. Przeciągaj, aby zmienić kolejność.
        </p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragged(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => moveImage(i)}
            className={`relative aspect-square rounded overflow-hidden border-2 ${
              img.isMain ? "border-primary" : "border-gray-400"
            }`}
          >
            <img src={img.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition">
              <div className="absolute inset-0 flex items-center justify-center text-xs">
                <div className="flex">
                  <button onClick={() => removeImage(img.id)}>
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="text-red-400 hover:text-red-500 bg-bg-secondary p-2 rounded-full"
                    />
                  </button>
                </div>
              </div>
            </div>
            {img.isMain && (
              <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                Główne
              </span>
            )}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 6 - images.length) }).map((_, i) => (
          <div
            key={i}
            onClick={() => inputRef.current.click()}
            className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:bg-bg_accent"
          >
            <FontAwesomeIcon icon={faUpload} size={22} />
            <span className="text-xs mt-1">Dodaj</span>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png"
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
