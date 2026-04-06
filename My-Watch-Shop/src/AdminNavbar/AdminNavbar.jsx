import {
  LogOut as LogOutIcon,
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
} from "lucide-react";
import "./AdminNav.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect } from "react";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const log = JSON.parse(localStorage.getItem("admin"));

  useEffect(() => {
    if (!log || log.role !== "admin") {
      navigate("/adminlogin");
    }
  }, [log, navigate]);

  if (!log || log.role !== "admin") return null;

  const handleLogout = () => {
    Swal.fire({
      title: "Terminate Session?",
      text: "You will be signed out of the admin portal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Logout",
      confirmButtonColor: "#1a1a1a",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("admin");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/adminlogin");
      }
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">W</div>
          <div className="brand-info">
            <span className="brand-title">WATCH SHOP</span>
            <span className="admin-badge">Registry</span>
          </div>
        </div>

        <div className="user-profile-section">
          <p className="welcome-text">Operator</p>
          <h3 className="admin-name">{log?.name}</h3>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${isActive("/userdetails") ? "active" : ""}`}
            onClick={() => navigate("/userdetails")}
          >
            <Users size={18} /> <span>Manage Users</span>
          </button>

          <button
            className={`nav-item ${isActive("/adminproducts") ? "active" : ""}`}
            onClick={() => navigate("/adminproducts")}
          >
            <Package size={18} /> <span>Inventory</span>
          </button>

          <button
            className={`nav-item ${isActive("/orderdetails") ? "active" : ""}`}
            onClick={() => navigate("/orderdetails")}
          >
            <ShoppingBag size={18} /> <span>Orders</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOutIcon size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}