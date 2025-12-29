"use client";
import ImageGalleryClient from "@/components/PictureSlider";
import FavoriteBtn from "@/components/FavoriteButton";
import CartBtn from "@/components/AddCartButton";
import ProductParameters from "@/components/ProductParameters";
import SimilarProductsCarousel from "@/components/SimilarProdCarousel";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  const { data } = useSWR(
    `http://localhost:5000/api/get_product/data/${id}`,
    fetcher
  );
  const product = data?.product ?? [];
  const imgs = product?.images ? product.images.split("||") : [];
  const galleryItems = imgs.map((url) => ({
    original: url,
    thumbnail: url,
  }));

  const { data: SimilarProducts } = useSWR(
    `http://localhost:5000/api/get_simular_products?category_id=${product.category_id}&id=${id}`,
    fetcher
  );
  const simularproducts = SimilarProducts?.products ?? [];
  return (
    <main className="flex flex-1 w-full flex-col justify-center items-center gap-9">
      <div className="flex flex-col w-10/12 bg-bg-secondary p-4 m-16 rounded-lg gap-3">
        <div className="flex flex-row flex-wrap text-sm sm:text-base gap-3 px-2">
          <Link href={"/"}>Strona główna</Link> /
          <Link href={`/categories/${product?.category_slug}`}>
            {product.category_name}
          </Link>
          /<p>{product.name}</p>
        </div>
        <div className="flex flex-col justify-center items-center xl:flex-row xl:items-start gap-8 p-2">
          <div className="flex max-w-[600px]">
            <ImageGalleryClient items={galleryItems} />
          </div>
          <div className="flex flex-col gap-7 w-full px-6">
            <div>
              <div className="flex flex-row justify-between gap-3">
                <p className="text-3xl font-bold">{product?.name}</p>
                <p className="bg-bg-accent h-fit py-2 px-3 rounded-lg">
                  {product.item_condition}
                </p>
              </div>
              <p className="text-sm text-gray-400">( REF: {id} )</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-4xl">{product?.price} zł</p>
              <p className="text-sm">Liczba sztuk: {product?.quantity}</p>
            </div>
            <div className="flex flex-row justify-between">
              <FavoriteBtn productId={id} />
              <CartBtn productId={id} />
            </div>
            <ProductParameters
              description={product?.description}
              shop_id={product?.shop_id}
              shop_address={product?.shop_address}
              shop_city={product?.shop_city}
              shop_phone={product?.shop_phone}
              shop_email={product?.shop_email}
              created_at={product?.created_at}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 text-center mb-10 max-w-10/12">
        <h1 className="text-3xl">Podobne Produkty</h1>
        {simularproducts.length !== 0 ? (
          <SimilarProductsCarousel items={simularproducts} />
        ) : (
          <div>
            <p>Nie znaleziono Podobnych Produktów</p>
          </div>
        )}
      </div>
    </main>
  );
}
