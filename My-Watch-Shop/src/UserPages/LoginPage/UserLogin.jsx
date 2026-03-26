import axios from 'axios'
import './LoginPage.css'
import Swal from 'sweetalert2'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
            // ... (Validation logic stays the same)
            const res = await axios.get(`http://localhost:3000/users?email=${loginData.email}`)
            const user = res.data[0]

            if (!user || user.password !== loginData.password) {
                Swal.fire({ title: "Error", text: "Invalid Credentials", icon: "error", confirmButtonColor: "#1a1a1a" });
                return
            }

            localStorage.setItem("loggeduser", JSON.stringify(user))
            navigate("/")
        } catch (err) {
            console.log("Error:", err)
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
                    <button className="reg-btn" onClick={Register}>Create One</button>
                </p>
            </div>
        </div>
    )
}