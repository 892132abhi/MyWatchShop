import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './RegisterPage.css'; 
import axiosInstance from '../../api/axiosInstance';

export default function UserRegister() {
  const navigate = useNavigate();
  const MIN_LOADER_TIME = 600;

  const [registerData, SetRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [err, SetErr] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  async function submitform(e) {
    e.preventDefault();
    setSubmitted(true);
    SetErr(""); 

    // Basic Validations
    if (!registerData.name || registerData.name.toLowerCase() === "guest") {
      SetErr("Please enter a valid name.");
      return;
    }
    if (!registerData.email.includes("@gmail.com")) {
      SetErr("A valid @gmail.com address is required.");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      SetErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    const loadingStartedAt = Date.now();

    try {
      const payload = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      };

      await axiosInstance.post('accounts/register/', payload);

      Swal.fire({
        title: "Registration Complete",
        text: "Welcome to our WatchStore.",
        icon: "success",
        confirmButtonColor: "#d4af37", 
      }).then(() => {
        navigate("/login");
      });

    } catch (error) {
      SetErr(error.response?.data?.message || "System error: " + error.message);
    } finally {
      const elapsed = Date.now() - loadingStartedAt;
      const remaining = Math.max(MIN_LOADER_TIME - elapsed, 0);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setLoading(false);
    }
  }

  return (
    <div className="luxury-page-wrapper">
      <form onSubmit={submitform} className="Form">
        <h2>Register</h2>
        <p className="subtitle">Create your account</p>

        <div className="regist">
          <div className="labels">
            <label>Name</label>
            <input 
              type="text" 
              placeholder="type your name" 
              value={registerData.name} 
              onChange={(e) => SetRegisterData({ ...registerData, name: e.target.value })} 
            />
          </div>
        </div>

        <div className="regist">
          <div className="labels">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@gmail.com" 
              value={registerData.email} 
              onChange={(e) => SetRegisterData({ ...registerData, email: e.target.value })} 
            />
          </div>
        </div>

        <div className="regist">
          <div className="labels">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={registerData.password} 
              onChange={(e) => SetRegisterData({ ...registerData, password: e.target.value })} 
            />
          </div>
        </div>

        <div className="regist">
          <div className="labels">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={registerData.confirmPassword} 
              onChange={(e) => SetRegisterData({ ...registerData, confirmPassword: e.target.value })} 
            />
          </div>
        </div>

        {submitted && err && <p className="error-text">{err}</p>}

        {/* The Button with Loader Logic */}
        <button type="submit" className="luxury-submit-btn" disabled={loading}>
          {loading ? <span className="loader-circle"></span> : "Create Account"}
        </button>
        
        <div className="form-footer">
          <span>Already a member?</span>
          <button type="button" className="login-link-btn" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
