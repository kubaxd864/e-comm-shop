import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function WykresLiniowy({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const [xKey, yKey] = Object.keys(data[0]);
  const chartData = data.map((item) => ({
    ...item,
    [xKey]: new Date(item[xKey]).toISOString().split("T")[0],
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" aspect={2.1}>
        <LineChart data={chartData} margin={{ right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke="#1D4ED8" name={yKey} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
