import Link from "next/link";
const statusStyles = {
  opłacone: "bg-orange-400/10 text-orange-500",
  potwierdzone: "bg-yellow-500/10 text-yellow-500",
  wysłane: "bg-green-500/10 text-green-500",
  anulowane: "bg-red-500/10 text-red-600",
};

export default function LatestOrders({ orders }) {
  return (
    <div className="bg-bg-secondary rounded-xl h-fit">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Latest orders</h2>
      </div>
      <div className="hidden md:grid grid-cols-4 px-6 py-3 text-sm font-medium border-b">
        <span>Order #</span>
        <span>Customer</span>
        <span>Date</span>
        <span>Status</span>
      </div>
      <div className="flex flex-col border-b">
        {orders.slice(0, 6).map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 px-6 py-4 text-sm border-b"
          >
            <div className="flex justify-between md:block">
              <span className="text-text-tertiary md:hidden">Order</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-text-tertiary md:hidden">Customer</span>
              <span>
                {order.name} {order.surname}
              </span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-text-tertiary md:hidden">Date</span>
              <span>{order.created_at.split("T")[0]}</span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-text-tertiary md:hidden">Status</span>
              <span
                className={`px-3 py-1 rounded text-xs font-medium capitalize w-fit ${
                  statusStyles[order.status]
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 text-right">
        <Link
          href={"admin_panel/orders"}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </div>
    </div>
  );
}
