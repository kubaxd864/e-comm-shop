"use client";
import useEmblaCarousel from "embla-carousel-react";
import SimilarProd from "./SimilarProdBox";

export default function SimilarProductsCarousel({ items = [] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  return (
    <div className="flex flex-row gap-5 relative">
      <button onClick={() => emblaApi?.scrollPrev()}>◀</button>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {items.map((it) => (
            <div key={it.id ?? it.name} className="flex-shrink-0 w-[205px]">
              <SimilarProd {...it} thumbnail={it.file_path} />
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => emblaApi?.scrollNext()}>▶</button>
    </div>
  );
}
