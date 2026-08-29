"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors } from "@/lib/colors";

interface ChartProps {
  data: {
    months: string[];
    income: number[];
    expenses: number[];
  };
}

export default function Chart({ data }: ChartProps) {
  const chartData = data.months.map((month, index) => ({
    name: month,
    Income: data.income[index],
    Expenses: data.expenses[index],
  }));

  return (
    <div
      className="rounded-xl p-6 shadow-md"
      style={{ backgroundColor: colors.surface }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
        Monthly Overview
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis
            dataKey="name"
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.border }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
          <Bar
            dataKey="Income"
            fill={colors.chartIncome}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Expenses"
            fill={colors.chartExpense}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
