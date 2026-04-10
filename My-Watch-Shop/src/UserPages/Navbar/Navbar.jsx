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
  Menu,
  X,
} from "lucide-react";
import { AppContext } from "../../AppProvider/APPContext";
import "animate.css";


export default function Navbar() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  }, [user]);

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
      <nav className="custom-navbar shadow-sm">
        <div className="navbar-top-row">
          <div className="brand-block">
            <h3 className="fw-bold brand-name animate__animated animate__fadeInDown">
              Watch<span style={{ color: "aqua" }}>flow</span>
            </h3>

            {user && (
              <h5 className="username wallet-text animate__animated animate__fadeIn">
                <Wallet size={18} /> <IndianRupee size={16} /> {wallets}
              </h5>
            )}
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className={`navbar-actions ${menuOpen ? "open" : ""}`}>
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
