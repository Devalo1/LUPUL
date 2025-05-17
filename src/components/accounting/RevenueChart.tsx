import React, { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

// Înregistrăm toate componentele necesare pentru Chart.js
Chart.register(...registerables);

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Formatarea valorilor pentru moneda RON
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Distruge grafikul existent dacă există
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const months = data.map(item => item.month);
    const revenues = data.map(item => item.revenue);

    // Creăm noul grafic
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Venituri lunare",
            data: revenues,
            backgroundColor: "rgba(79, 70, 229, 0.6)", // Indigo în stil Tailwind
            borderColor: "rgba(79, 70, 229, 1)",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                if (typeof value === "number") {
                  return formatCurrency(value);
                }
                return value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `Venituri: ${formatCurrency(value)}`;
              },
            },
          },
          legend: {
            display: false,
          },
        },
      },
    });

    // Curățare la demontarea componentei
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-500">Nu există date disponibile</div>;
  }

  return (
    <div className="h-72">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default RevenueChart;