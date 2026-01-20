import { useEffect, useState } from "react";
import { getHabitAnalytics, getPomodoroStats } from "../../api/habits.api";
import "../../styles/Analytics.css";

export default function Analytics() {
  const [habitStreak, setHabitStreak] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalHabits, setTotalHabits] = useState(0);
  const [pomodoroStats, setPomodoroStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [habitRes, pomodoroRes] = await Promise.all([
          getHabitAnalytics(),
          getPomodoroStats(),
        ]);

        setHabitStreak(habitRes.data.streak || 0);
        setMonthlyData(habitRes.data.monthlyData || []);
        setTotalHabits(habitRes.data.totalHabits || 0);
        setPomodoroStats(pomodoroRes.data?.data || pomodoroRes.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setPomodoroStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getTotalFocusHours = () => {
    if (!pomodoroStats) return 0;
    return (pomodoroStats.total_minutes / 60).toFixed(1);
  };

  const getDaysInCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const getChartData = () => {
    const daysInMonth = getDaysInCurrentMonth();
    const data = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthlyData.find(
        (d) => new Date(d.date).getDate() === day,
      );
      data.push({
        day,
        count: dayData?.habits_completed || 0,
      });
    }

    return data;
  };

  const generateLineChartSVG = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return null;

    const maxCount = Math.max(1, totalHabits);
    const yAxisSteps = Math.ceil(maxCount);
    const viewWidth = 900;
    const viewHeight = 400;
    const padding = { top: 50, right: 40, bottom: 70, left: 70 };
    const chartWidth = viewWidth - padding.left - padding.right;
    const chartHeight = viewHeight - padding.top - padding.bottom;

    // Calculate points for the line
    const points = chartData.map((data, idx) => {
      const xRatio =
        chartData.length === 1 ? 0.5 : idx / (chartData.length - 1);
      const x = padding.left + xRatio * chartWidth;
      const y = padding.top + (1 - data.count / maxCount) * chartHeight;
      return { x, y, ...data };
    });

    // Create smooth curve path using quadratic Bézier curves
    const createSmoothPath = (pts) => {
      if (pts.length < 2) return "";
      let path = `M${pts[0].x},${pts[0].y}`;

      for (let i = 0; i < pts.length - 1; i++) {
        const current = pts[i];
        const next = pts[i + 1];
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        path += ` Q${controlX},${controlY} ${next.x},${next.y}`;
      }
      return path;
    };

    const pathData = createSmoothPath(points);

    // Create smooth area path
    const areaPath =
      pathData +
      ` L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${
        padding.top + chartHeight
      } Z`;

    // Generate grid lines and y-axis labels for each habit count
    const gridLinesAndLabels = Array.from(
      { length: yAxisSteps + 1 },
      (_, i) => {
        const ratio = i / yAxisSteps;
        return ratio;
      },
    );

    return (
      <svg
        className="chart-svg"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines and Y-axis labels */}
        {gridLinesAndLabels.map((ratio) => (
          <g key={`grid-${ratio}`}>
            <line
              x1={padding.left}
              y1={padding.top + (1 - ratio) * chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + (1 - ratio) * chartHeight}
              stroke="#1e2440"
              strokeDasharray="4"
              strokeWidth="1"
            />
            <text
              x={padding.left - 15}
              y={padding.top + (1 - ratio) * chartHeight + 5}
              textAnchor="end"
              fontSize="12"
              fill="#d6d9ff"
              fontWeight="500"
            >
              {Math.round(ratio * maxCount)}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#d6d9ff"
          strokeWidth="2"
        />
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#d6d9ff"
          strokeWidth="2"
        />

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={pathData}
          stroke="#4f46e5"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, idx) => (
          <g key={`point-${idx}`}>
            <circle cx={point.x} cy={point.y} r="3" fill="#4f46e5" />
            <circle cx={point.x} cy={point.y} r="1.5" fill="white" />
          </g>
        ))}

        {/* X-axis labels - show all days */}
        {points.map((point, idx) => (
          <text
            key={`x-label-${idx}`}
            x={point.x}
            y={padding.top + chartHeight + 35}
            textAnchor="middle"
            fontSize="10"
            fill="#d6d9ff"
            fontWeight="500"
          >
            {point.day}
          </text>
        ))}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <h1>Analytics</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Streak</h3>
            <p className="stat-value">{habitStreak}d</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Focus Hours</h3>
            <p className="stat-value">{getTotalFocusHours()}h</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Sessions</h3>
            <p className="stat-value">{pomodoroStats?.total_sessions || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏲️</div>
          <div className="stat-content">
            <h3>Avg Duration</h3>
            <p className="stat-value">
              {typeof pomodoroStats?.avg_duration === "number"
                ? Math.round(pomodoroStats.avg_duration)
                : 0}
              m
            </p>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h2>Habits Completed Per Day (This Month)</h2>
        <div className="chart-container">
          <div className="line-chart">{generateLineChartSVG()}</div>
        </div>
      </div>
    </div>
  );
}
