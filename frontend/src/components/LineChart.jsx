import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function WykresLiniowy({ data = [], title, sum }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const [xKey, yKey] = hasData ? Object.keys(data[0]) : ["label", "value"];
  const chartData = hasData
    ? data.map((item) => ({
        ...item,
        [xKey]: new Date(item[xKey]).toISOString().split("T")[0],
      }))
    : [];

  return (
    <div className="flex flex-col gap-4 p-3.5 w-1/3 bg-bg-secondary rounded-lg">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm">Poniedziałek - Niedziela</p>
        </div>
        <p className="text-2xl">{sum}</p>
      </div>
      <div className="w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" aspect={2.1}>
            <LineChart data={chartData} margin={{ right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#1D4ED8"
                name={yKey}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-sm">
            Brak danych
          </div>
        )}
      </div>
    </div>
  );
}
