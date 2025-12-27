import { useCart } from "@/hooks/useCart";
import { useFormContext } from "react-hook-form";

export default function DeliveryOptions() {
  const {
    groupedByStore,
    deliverySelections,
    isLoading,
    error,
    updateDeliveryPrice,
  } = useCart();
  const { register } = useFormContext();
  return (
    <div className="flex flex-col gap-3 p-4 bg-bg-secondary rounded-sm w-3/4">
      {isLoading ? (
        <div className="w-full text-center">
          <p>Ładowanie opcji dostawy...</p>
        </div>
      ) : error ? (
        <div className="w-full text-center">
          <p>Nie udało się pobrać danych o dostawie.</p>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {groupedByStore.map((store, store_idx) => {
            const selectedDelivery = deliverySelections?.[store.store_id];
            return (
              <div className="flex flex-col gap-4" key={store_idx}>
                <p>Przesyłka od: {store.store_name}</p>
                <div className="flex flex-col gap-5 w-full h-[300px] overflow-auto hide-scrollbar">
                  {store.deliveryOptions
                    ?.filter((e) => e?.courier?.name !== "epaka.pl SPEDYCJA")
                    .map((e, idx) => (
                      <div
                        key={idx}
                        className="flex flex-row items-center gap-4 p-4 bg-bg-accent rounded hover:border-[1px] border-gray-400"
                      >
                        <input
                          type="radio"
                          value={e.courier?.name}
                          {...register(`delivery.${store.store_id}`)}
                          defaultChecked={
                            selectedDelivery
                              ? Number(selectedDelivery?.price) ===
                                Number(e.grossPriceTotal)
                              : Number(store.cheapestdelivery ?? 0) ===
                                Number(e.grossPriceTotal)
                          }
                          onChange={() =>
                            updateDeliveryPrice(
                              store.store_id,
                              e.grossPriceTotal
                            )
                          }
                          className="form-radio"
                        />
                        <img
                          src={e.courier.logo}
                          alt={e.courier.name}
                          className="w-12 h-auto"
                        />
                        <div className="flex flex-col">
                          <p className="font-semibold">{e.courier.name}</p>
                          <p>Dostawa: {e.estimatedDeliveryShort}</p>
                        </div>
                        <p className="font-bold ml-auto">
                          {e.grossPriceTotal} zł
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
