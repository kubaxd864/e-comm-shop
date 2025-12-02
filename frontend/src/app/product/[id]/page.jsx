import ImageGalleryClient from "@/components/PictureSlider";
import FavoriteBtn from "@/components/FavoriteButton";
import CartBtn from "@/components/CartButton";
import ProductDescription from "@/components/ProductDescription";
import axios from "axios";
import Link from "next/link";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const { product, galleryItems } = await ProductData();
  const images = galleryItems;

  async function ProductData() {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/get_product/data/${id}`
      );
      const product = res.data?.product || null;
      const imgs = product?.images ? product.images.split("||") : [];
      const galleryItems = imgs.map((url) => ({
        original: url,
        thumbnail: url,
      }));
      return { product, galleryItems };
    } catch (err) {
      console.error(err);
      return { product: null, galleryItems: [] };
    }
  }
  return (
    <main className="flex flex-1 w-full flex-col justify-center items-center gap-9 bg-white dark:bg-black">
      <div className="flex flex-col w-10/12 bg-zinc-900 p-4 m-16 rounded-lg gap-3">
        <div className="flex flex-row gap-3 px-2">
          <Link href={"/"}>Strona główna</Link> /
          <Link href={`/categories/${product.category_slug}`}>
            {product.category_name}
          </Link>
          /<p>{product.name}</p>
        </div>
        <div className="flex flex-row gap-8 p-2">
          <div className="max-w-[600px]">
            <ImageGalleryClient items={images} />
          </div>
          <div className="flex flex-col gap-7 w-full px-6">
            <div>
              <div className="flex flex-row justify-between">
                <p className="text-3xl font-bold">{product.name}</p>
                <p className="bg-zinc-800 h-fit py-2 px-3 rounded-lg">
                  {product.item_condition}
                </p>
              </div>
              <p className="text-sm text-gray-400">( REF: {id} )</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-4xl">{product.price} zł</p>
              <p className="text-sm">Liczba sztuk: 1</p>
            </div>
            <div className="flex flex-row justify-between">
              <FavoriteBtn />
              <CartBtn />
            </div>
            <ProductDescription
              description={product.description}
              shop_address={product.shop_address}
              shop_city={product.shop_city}
              shop_phone={product.shop_phone}
              shop_email={product.shop_email}
              created_at={product.created_at}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl">Podobne Produkty</h1>
        <div></div>
      </div>
    </main>
  );
}
