import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./adminlog.css";
import axiosInstance from "../api/axiosInstance";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!login.email.trim() || !login.password.trim()) {
      return Swal.fire("Required", "Please provide all credentials", "warning");
    }

    try {
      const res = await axiosInstance.post("accounts/adminlogin/", {
        email: login.email,
        password: login.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem(
        "admin",
        JSON.stringify({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        })
      );

      Swal.fire({
        title: "Successfully Logged",
        text: "Welcome to the Command Center",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Access Denied",
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.message ||
          "Invalid administrative credentials",
        "error"
      );
    }
  };

  return (
    <div className="admin-login-page">
      <div className="luxury-login-card">
        <button className="back-btn" onClick={() => navigate("/")}>
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
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
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