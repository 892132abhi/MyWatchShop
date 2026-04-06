import { useContext, useEffect, useState } from "react";
import "./navbar.css";
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
  Wallet,
  IndianRupee,
} from "lucide-react";
import { AppContext } from "../../AppProvider/APPContext";
import "animate.css";
import "./Navbar.css";


export default function Navbar() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const { wallets,addcart, wishlist, fetchCounts } = useContext(AppContext);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const storedUser = JSON.parse(localStorage.getItem("loggeduser"));

    if (!token) {
      navigate("/login");
      return;
    }

    setUser(storedUser);
    setLogin(!!storedUser);

    if (storedUser && !storedUser.active) {
      Swal.fire({
        title: "This account is blocked by Admin",
        icon: "error",
      });
    }
  }, [navigate]);

  useEffect(() => {
      const token = localStorage.getItem("access");
      if (!token) return;

    if (login) {
      if (fetchCounts) {
        fetchCounts();
      }
    }
  }, [login, fetchCounts]);

  const LOGIN = () => {
    const storedUser = localStorage.getItem("loggeduser");
    if (storedUser) {
      Swal.fire({
        title: "User already logged in!",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      navigate("/login");
    }
  };

  const Logout = () => {
    Swal.fire({
      icon: "warning",
      title: "Do you want to logout?",
      showDenyButton: true,
      showConfirmButton: true,
      denyButtonText: "No",
      confirmButtonText: "Yes",
      denyButtonColor: "rgb(168, 242, 164)",
      confirmButtonColor: "rgb(194, 53, 21)",
      customClass: {
        confirmButton: "confirm",
        denyButton: "deny",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("loggeduser");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setLogin(false);
        setUser(null);
        navigate("/");

        Swal.fire({
          title: "User Logged Out!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg custom-navbar px-4 shadow-sm">
        <h3 className="fw-bold brand-name animate__animated animate__fadeInDown">
          Watch<span style={{ color: "aqua" }}>flow</span>
        </h3>

        {user && (
          <h5 className="username animate__animated animate__fadeIn">
            <Wallet size={18} />  <IndianRupee /> {wallets}
          </h5>
        )}

        <div className="ms-auto d-flex align-items-center gap-3">
          {user ? (
            <h5 className="username animate__animated animate__zoomIn">
              <User size={18} /> Hi, {user.name}
            </h5>
          ) : (
            <h5 className="username">Guest</h5>
          )}

          {!login && (
            <button className="btn nav-btn" onClick={LOGIN}>
              Login <LogIn size={18} />
            </button>
          )}

          <button className="btn nav-btn" onClick={() => navigate("/products")}>
            Products <ShoppingBasket size={18} />
          </button>

          {login && (
            <button className="btn nav-btn" onClick={() => navigate("/cart")}>
              <ShoppingCart size={18} /> {addcart}
            </button>
          )}

          {login && (
            <button
              className="btn nav-btn wishlist-btn"
              onClick={() => navigate("/wishlist")}
            >
              <Heart size={18} /> {wishlist}
            </button>
          )}

          {login && (
            <button
              className="btn nav-btn logout-btn"
              onClick={() => navigate("/orders")}
            >
              <ClipboardList size={18} />
            </button>
          )}

          {login && (
            <button className="btn nav-btn logout-btn" onClick={Logout}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
}