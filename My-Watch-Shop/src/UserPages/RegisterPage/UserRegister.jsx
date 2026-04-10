import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import './RegisterPage.css' // Ensure your luxury CSS is here
import axiosInstance from '../../api/axiosInstance'

export default function UserRegister() {
  const navigate = useNavigate()

  const [registerData, SetRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [err, SetErr] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function submitform(e) {
    e.preventDefault()
    setSubmitted(true)
    SetErr("") // Reset error

    // Basic Validations
    if (!registerData.name || registerData.name.toLowerCase() === "guest") {
      SetErr("Please enter a valid name.")
      return
    }
    if (!registerData.email.includes("@gmail.com")) {
      SetErr("A valid @gmail.com address is required.")
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      SetErr("Passwords do not match.")
      return
    }

    try {
        const payload={
        name:registerData.name,
        email:registerData.email,
        password:registerData.password
      }
      

      await axiosInstance.post('accounts/register/',
        payload
      )

      Swal.fire({
        title: "Registration Complete",
        text: "Welcome to our WatchStore.",
        icon: "success",
        confirmButtonColor: "#d4af37", 
      })

    } catch (error) {
      SetErr("System error: " + error.message)
    }
  }

  return (
    <div className="luxury-page-wrapper">
      <form onSubmit={submitform} className="Form">
        <h2>Register</h2>
        <p className="subtitle">Create your  account</p>

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

        <button className="luxury-submit-btn">Create Account</button>
        
        <div className="form-footer">
          <span>Already a member?</span>
          <button type="button" className="login-link-btn" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}