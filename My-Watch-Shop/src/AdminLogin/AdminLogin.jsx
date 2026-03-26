import axios from "axios";
import { MoveLeft } from "lucide-react"; // More "Luxury" back icon
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './adminlog.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [login, setLogin] = useState({ name: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!login.name.trim() || !login.password.trim()) {
      return Swal.fire("Required", "Please provide all credentials", "warning");
    }

    try {
      const res = await axios.get("http://localhost:3000/admin");
      const admin = res.data[0];

      if (!admin || login.name !== admin.adminName || login.password !== admin.password) {
        return Swal.fire("Access Denied", "Invalid administrative credentials", "error");
      }

      // Store admin session
      localStorage.setItem("Admin", JSON.stringify(admin));

      Swal.fire({
        title: "Authenticated",
        text: "Welcome to the Command Center",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Dashboard");
    } catch (err) {
      console.error(err);
      Swal.fire("System Error", "Connection to vault failed", "error");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="luxury-login-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MoveLeft size={20} />
          <span>Return</span>
        </button>

        <header className="login-header">
          <div className="brand-dot"></div>
          <h3>ADMIN</h3>
          <p>Secure Administrative Portal</p>
        </header>

        <form onSubmit={onSubmit} className="login-form">
          <div className="input-wrapper">
            <label>Identity</label>
            <input
              type="text"
              placeholder="Username"
              value={login.name}
              onChange={(e) => setLogin({ ...login, name: e.target.value })}
            />
          </div>

          <div className="input-wrapper">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Authorize Access
          </button>
        </form>
      </div>
    </div>
  );
}