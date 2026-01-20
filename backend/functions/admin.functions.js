import { promisePool } from "../config/db.js";
import cloudinaryPkg from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export async function fetchOrders() {
  const [orders] = await promisePool.query(
    "SELECT o.id, u.name, u.surname, o.total_amount, o.status, o.created_at FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC",
  );
  return orders;
}

export async function fetchLatestProducts() {
  const [products] = await promisePool.query(
    `SELECT p.id, p.name, p.price, p.store_id, p.is_active, p.created_at, img.file_path AS thumbnail FROM products p 
    LEFT JOIN product_images img ON img.product_id = p.id AND img.is_main ORDER BY p.created_at DESC`,
  );
  return products;
}

export function uploadToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({
          uploadId: result.public_id,
          url: result.secure_url,
        });
      },
    );
    uploadStream.end(file.buffer);
  });
}

export function getPublicIdFromUrl(url) {
  const parts = url.split("/");
  const fileName = parts.pop();
  return `products/${fileName.split(".")[0]}`;
}

export async function deleteFromCloudinary(publicId) {
  return await cloudinary.uploader.destroy(publicId);
}
