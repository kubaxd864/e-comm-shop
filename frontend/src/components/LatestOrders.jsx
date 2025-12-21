const statusStyles = {
  opłacone: "bg-orange-100 text-orange-700",
  potwierdzone: "bg-yellow-100 text-yellow-700",
  wysłane: "bg-green-100 text-green-700",
  anulowane: "bg-red-100 text-red-700",
};

export default function LatestOrders({ orders }) {
  return (
    <div className="bg-zinc-900 rounded-xl h-fit">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Latest orders</h2>
      </div>
      <div className="flex flex-col">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-6 py-4.5 font-medium">{order.id}</td>
                <td className="px-6 py-4.5">
                  {order.name + " " + order.surname}
                </td>
                <td className="px-6 py-4.5">
                  {order.created_at.split("T")[0]}
                </td>
                <td className="px-6 py-4.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusStyles[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 text-right">
        <button className="text-sm font-medium text-blue-700 cursor-pointer hover:underline">
          View all →
        </button>
      </div>
    </div>
  );
}
