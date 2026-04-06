import './LoginPage.css'
import Swal from 'sweetalert2'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

export default function UserLogin() {
    const [loginData, SetLoginData] = useState({
        email: "",
        password: ""
    })

    const navigate = useNavigate()

    const Register = () => navigate("/register")

    async function HandleSubmit(e) {
        e.preventDefault()
        try {
            const res = await axiosInstance.post('accounts/login/',{
                email:loginData.email,
                password:loginData.password
            })
            Swal.fire({
                    title: "Login Complete",
                    text: "Welcome to our WatchStore.",
                    icon: "success",
                    confirmButtonColor: "#d4af37", 
                  }).then(() =>{
                    localStorage.setItem("access", res.data.access)
                    localStorage.setItem("refresh", res.data.refresh)
                     localStorage.setItem("loggeduser", JSON.stringify(res.data))
                     navigate("/")
                  })
            if (!res.data.active){
                Swal.fire({
                    title:" Account Blocked",
                    icon:"error",
                    text:"admin blocked this account",
                    showConfirmButton:false
                })
            }
        } catch (err) {
            console.log("Error:", err)
            const message = 
            err.response?.data?.non_field_errors?.[0]||
            err.response?.data?.detail||
            err.response?.data?.message ||
            "invalid email and password"

            Swal.fire({
                icon:"error",
                text:message,
                title:"Login Failed",
                confirmButtonColor:"#d4af37"
            })
        }
    }

    return (
        <div className="login-page-container">
            <div className="LoginPage">
                <h2>The Watch Store</h2>
                {/* <p className="subtitle">Est. 2026 — Heritage & Precision</p> */}
                
                <form onSubmit={HandleSubmit}>
                    <div className='logindiv'>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={loginData.email} 
                            onChange={(e) => SetLoginData({ ...loginData, email: e.target.value })} 
                        />
                    </div>
                    
                    <div className='logindiv'>
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            value={loginData.password} 
                            onChange={(e) => SetLoginData({ ...loginData, password: e.target.value })} 
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Sign In
                    </button>
                </form>

                <p className='reg-text'>
                    Don't have an account? 
                    <button type="button" className="reg-btn" onClick={Register}>Create One</button>
                </p>
            </div>
        </div>
    )
}
