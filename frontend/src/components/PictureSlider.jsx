"use client";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useEffect, useState } from "react";

export default function ImageGalleryClient({ items }) {
  const [showThumbs, setShowThumbs] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 800px)");
    const update = () => setShowThumbs(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <ImageGallery
      items={items}
      showPlayButton={false}
      showThumbnails={showThumbs}
      renderItem={(item) => (
        <div className="flex items-center justify-center h-full overflow-auto">
          <img
            src={item.original}
            alt=""
            className="w-full h-[400px] object-contain bg-white"
          />
        </div>
      )}
      renderThumbInner={(item) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={item.thumbnail || item.original}
            alt={item.thumbnail || item.original}
            className="w-20 h-20 object-contain bg-white rounded"
          />
        </div>
      )}
    />
  );
}
