import { useEffect, useState } from "react";
import './dashboard.css';
import { Ban, Package, UserCheck2, Users,  IndianRupee } from "lucide-react";
import "animate.css";
import axiosInstance from "../api/axiosInstance";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Tooltip, Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Tooltip, Filler
);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TOOLTIP = {
  backgroundColor: "#1a1a1a",
  titleFont: { size: 11 },
  bodyFont: { size: 11 },
  padding: 10,
  cornerRadius: 2,
};

export default function DashBoard() {
  const [order, setOrder] = useState([]);
  const [user, setUser]   = useState([]);
  const [active, setActive]   = useState([]);
  const [noActive, setNoActive] = useState([]);
  const [revenue,setRevenue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res   = await axiosInstance.get("dashboard/totalorders/");
        setOrder(res.data);
        const u     = await axiosInstance.get("dashboard/totalusers");
        setUser(u.data);
        const act   = await axiosInstance.get("dashboard/activeusers/");
        setActive(act.data);
        const block = await axiosInstance.get("dashboard/blockedusers/");
        setNoActive(block.data);
        const amount = await axiosInstance.get("dashboard/totalrevenue/");
        setRevenue(amount.data)
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  /* ── Chart data ── */
  const lineData = {
    labels: MONTHS,
    datasets: [
      {
        label: "This month",
        data: [65,80,72,95,110,130,118,145,162,148,175,190],
        borderColor: "#1a1a1a",
        backgroundColor: "rgba(26,26,26,0.04)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#1a1a1a",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Last month",
        data: [50,60,58,75,88,102,95,120,135,122,148,162],
        borderColor: "#c9a84c",
        backgroundColor: "rgba(201,168,76,0.04)",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#c9a84c",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: "Delivered", data: [40,55,48,65,72,88,82,100,115,98,122,135], backgroundColor: "#1a1a1a", borderRadius: 2, barPercentage: 0.6 },
      { label: "Pending",   data: [15,18,14,22,28,32,25,35,38,40,42,45],    backgroundColor: "#c9a84c", borderRadius: 2, barPercentage: 0.6 },
      { label: "Cancelled", data: [10,7,10,8,10,10,11,10,9,10,11,10],       backgroundColor: "#e8e6e0", borderRadius: 2, barPercentage: 0.6 },
    ],
  };

  const donutData = {
    labels: ["Active", "Restricted", "New"],
    datasets: [{ data: [76,14,10], backgroundColor: ["#1a1a1a","#c9a84c","#e8e6e0"], borderWidth: 0, hoverOffset: 4 }],
  };

  const axisStyle = {
    grid: { color: "rgba(0,0,0,0.04)" },
    ticks: { font: { size: 10 }, color: "#bbb" },
    border: { display: false },
  };

  return (
    <div className="dashboard-wrapper">
      {/* ── existing header ── */}
      <header className="db-header">
        <div>
          <h1>Executive Overview</h1>
          <p>Real-time analytics &amp; performance tracking</p>
        </div>
        <div className="revenue-badge animate__animated animate__fadeIn">
          <IndianRupee size={16} /> {revenue}
        </div>
      </header>

      {/* ── existing stat cards ── */}
      <div className="stats-grid">
        <div className="stat-card animate__animated animate__fadeIn">
          <div className="stat-icon orders"><Package size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{order}</h3>
          </div>
        </div>
        <div className="stat-card animate__animated animate__fadeIn">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Clients</p>
            <h3 className="stat-value">{user}</h3>
          </div>
        </div>
        <div className="stat-card animate__animated animate__fadeIn">
          <div className="stat-icon active"><UserCheck2 size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Active Now</p>
            <h3 className="stat-value">{active}</h3>
          </div>
        </div>
        <div className="stat-card animate__animated animate__fadeIn">
          <div className="stat-icon blocked"><Ban size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Restricted</p>
            <h3 className="stat-value">{noActive}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">

        <div className="chart-card chart-wide">
          <div className="chart-card-head">
            <div>
              <p className="chart-label">Orders over time</p>
              <p className="chart-value">{order} <span className="chart-trend">{order%100}</span></p>
            </div>
            <div className="chart-legend">
              <span className="leg-item"><span className="leg-dot" style={{background:"#1a1a1a"}}/>This month</span>
              <span className="leg-item"><span className="leg-dot" style={{background:"#c9a84c"}}/>Last month</span>
            </div>
          </div>
          <div className="chart-canvas-wrap" style={{height: 200}}>
            <Line
              data={lineData}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: TOOLTIP },
                scales: {
                  x: { grid: { display: false }, ticks: { font:{size:10}, color:"#bbb", maxRotation: 0 }, border:{display:false} },
                  y: axisStyle,
                },
              }}
            />
          </div>
        </div>

        <div className="charts-row">
          {/* Donut chart */}
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <p className="chart-label">User breakdown</p>
                <p className="chart-value">{user || "0"}</p>
              </div>
            </div>
            <div className="chart-legend" style={{marginBottom:12}}>
              <span className="leg-item"><span className="leg-dot" style={{background:"#1a1a1a"}}/>Active 76%</span>
              <span className="leg-item"><span className="leg-dot" style={{background:"#c9a84c"}}/>Restricted 14%</span>
              <span className="leg-item"><span className="leg-dot" style={{background:"#e8e6e0"}}/>New 10%</span>
            </div>
            <div className="chart-canvas-wrap" style={{height:180}}>
              <Doughnut
                data={donutData}
                options={{
                  responsive: true, maintainAspectRatio: false, cutout: "20%",
                  plugins: { legend: { display: false }, tooltip: TOOLTIP },
                }}
              />
            </div>
          </div>

          {/* Stacked bar chart */}
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <p className="chart-label">Orders by status</p>
                <p className="chart-value">{order || "0"}</p>
              </div>
            </div>
            <div className="chart-legend" style={{marginBottom:12}}>
              <span className="leg-item"><span className="leg-dot" style={{background:"#1a1a1a"}}/>Delivered</span>
              <span className="leg-item"><span className="leg-dot" style={{background:"#c9a84c"}}/>Pending</span>
              <span className="leg-item"><span className="leg-dot" style={{background:"#e8e6e0"}}/>Cancelled</span>
            </div>
            <div className="chart-canvas-wrap" style={{height:180}}>
              <Bar
                data={barData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: TOOLTIP },
                  scales: {
                    x: { stacked:true, grid:{display:false}, ticks:{font:{size:10},color:"#bbb",maxRotation:0}, border:{display:false} },
                    y: { ...axisStyle, stacked: true },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}