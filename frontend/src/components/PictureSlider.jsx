"use client";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export default function ImageGalleryClient({ items }) {
  return (
    <ImageGallery
      items={items}
      showPlayButton={false}
      renderItem={(item) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <img
            src={item.original}
            alt=""
            style={{
              backgroundColor: "white",
              width: "600px",
              height: "400px",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    />
  );
}
