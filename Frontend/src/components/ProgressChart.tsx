import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const getLastNDays = (n) => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (n - 1 - i));

    const day = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    const dateKey = date.toISOString().slice(0, 10);

    days.push({ day, dateKey });
  }

  return days;
};

const ProgressChart = () => {
  const [view, setView] = useState("30D");
  const [progressData, setProgressData] = useState([]);
  const [total, setTotal] = useState(0);
  const [bestDay, setBestDay] = useState("");
  const [average, setAverage] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/questions/monthly-progress",
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("Response not OK:", res.status);
          return;
        }

        const data = await res.json();
        console.log("Fetched progress data from backend:", data);

        const days = getLastNDays(view === "7D" ? 7 : 30);
        const counts = {};

        data.forEach((item) => {
          const day = item.day;
          counts[day] = item.questions;
        });

        const chartData = days.map((d) => ({
          day: d.day,
          questions: counts[d.day] || 0,
        }));

        console.log("Computed chartData:", chartData);

        const totalSolved = chartData.reduce((a, b) => a + b.questions, 0);
        const best = chartData.reduce((max, d) =>
          d.questions > max.questions ? d : max
        );

        setProgressData(chartData);
        setTotal(totalSolved);
        setBestDay(best?.day || "-");
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    console.log("Fetching progress for view:", view);
    fetchProgress();
  }, [view]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 60, damping: 12 }}
      className="cyber-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-purple" />
          Progress Overview
        </h2>
        <div className="flex space-x-2">
          {["7D", "30D"].map((label) => (
            <button
              key={label}
              onClick={() => setView(label)}
              className={`px-4 py-1 rounded-full text-sm border transition-all ${
                view === label
                  ? "bg-neon-purple text-black font-semibold"
                  : "border-gray-700 text-gray-400 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-400 mb-3">
        <span>
          Total Solved:{" "}
          <span className="text-white font-semibold">{total}</span>
        </span>

        <span>
          Best Day: <span className="text-white font-semibold">{bestDay}</span>
        </span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressData}>
            <defs>
              <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B026FF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="day"
              stroke="#888"
              tick={{ fontSize: 10 }}
              angle={-35}
              textAnchor="end"
            />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                background: "#1A1A1A",
                border: "1px solid rgba(176, 38, 255, 0.2)",
                borderRadius: "8px",
              }}
            />

            <Line
              type="monotone"
              dataKey="questions"
              stroke="#B026FF"
              fill="url(#colorQuestions)"
              strokeWidth={2}
              dot={{ fill: "#B026FF" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ProgressChart;
