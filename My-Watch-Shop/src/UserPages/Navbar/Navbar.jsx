import { useContext, useEffect, useState } from "react";
import './navbar.css'
import { Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingCart,
  LogIn,
  LogOut,
  ShoppingBasket,
  Heart,
  User,
  ClipboardList,
} from "lucide-react";
import { AppContext } from "../../AppProvider/APPContext";
import "animate.css";
import "./Navbar.css"; // 👈 Create CSS file

export default function Navbar() {
  const [login, setlogin] = useState(false);
  const navigate = useNavigate();
  const { addcart, wishlist } = useContext(AppContext);
  const log = JSON.parse(localStorage.getItem("loggeduser"));

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("loggeduser"));
      setlogin(!!user);
      if (user && !user.active) {
        Swal.fire({
          title: "This account is blocked by Admin",
          icon: "error",
        });
      }
    } catch (err) {
      console.log("error found", err);
    }
  }, []);

  const LOGIN = () => {
    const user = localStorage.getItem("loggeduser");
    if (user) {
      Swal.fire({
        title: "User already logged in!",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    } else navigate("/login");
  };

  const Logout = () => {
    Swal.fire({
          icon:"warning",
          title:"do you want to logout?",
          showDenyButton:true,
          showConfirmButton:true,
          denyButtonText:"No",
          confirmButtonText:"Yes",
          denyButtonColor:"rgb(168, 242, 164)",
          confirmButtonColor:"rgb(194, 53, 21)",
          customClass:{
            confirmButton :"confirm",
            denyButton:"deny"
          }    
        }).then((result)=>{
              if(result.isConfirmed){
                const user = localStorage.getItem("loggeduser");
                navigate('/')
    if (user) {
      localStorage.removeItem("loggeduser");
      setlogin(false);
      Swal.fire({
        title: "User Logged Out!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
              }
            })
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg custom-navbar px-4 shadow-sm">
        <h2 className="fw-bold brand-name animate__animated animate__fadeInDown">
          Watch<span style={{ color: "aqua" }}>Store</span>
        </h2>

        <div className="ms-auto d-flex align-items-center gap-3">
          {log && (
            <h5 className="username animate__animated animate__zoomIn">
              <User /> Hi,{log.name}
            </h5>
          )}

          {!log && <h5 className="username">Guest</h5>}

          {!login && (
            <button className="btn nav-btn" onClick={LOGIN}>
              Login <LogIn />
            </button>
          )}

          <button className="btn nav-btn" onClick={() => navigate("/products")}>
            Products <ShoppingBasket />
          </button>

          {login && (
            <button className="btn nav-btn" onClick={() => navigate("/cart")}>
              <ShoppingCart /> {addcart.length}
            </button>
          )}

          {login && (
            <button className="btn nav-btn wishlist-btn" onClick={() => navigate("/wishlist")}>
              <Heart /> {wishlist.length}
            </button>
          )}
            {login && (
            <button className="btn nav-btn logout-btn" onClick={()=>navigate("/orders")}>
              <ClipboardList/>
            </button>
          )}
          {login && (
            <button className="btn nav-btn logout-btn" onClick={Logout}>
              <LogOut />
            </button>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
}
