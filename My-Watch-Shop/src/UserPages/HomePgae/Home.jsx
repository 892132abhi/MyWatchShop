import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import { useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const log = JSON.parse(localStorage.getItem("loggeduser"));
    if (!log) return;

    let interval;
    const fetchData = async () => {
      const Data = await axios.get(`http://localhost:3000/users/${log.id}`);
      const res = Data.data;
      if (!res.active) {
        clearInterval(interval);
        Swal.fire().then(() => {
          localStorage.removeItem("loggeduser");
          navigate("/");
          window.location.reload();
        });
      }
    };

    fetchData();
    interval = setInterval(fetchData, 1400);
    return () => clearInterval(interval);
  }, [navigate]);

  const goProducts = () => navigate("/products");

  return (
    <div className="container-fluid p-0">

      {/* 🔥 HERO SECTION WITH VIDEO BACKGROUND */}
      <div className="hero-wrapper position-relative text-center">
        <video autoPlay muted loop className="hero-video">
          <source src="video/11899562-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1 className="display-4 fw-bold text-white">
            Redefining Luxury Timepieces
          </h1>
          <p className="text-light fs-5 mt-2">
            Elegance • Precision • Legacy
          </p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button className="btn btn-warning btn-lg px-4" onClick={goProducts}>
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* ✨ FEATURED COLLECTION CARDS */}
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-4">Featured Collection</h2>

        <div className="row g-4">
          {[
            { img: "/backgroundimage/backgoundimg2.jpg", title: "Royal Edition" },
            { img: "/backgroundimage/backgroundimg3.jpg", title: "Classic Men Series" },
            { img: "/backgroundimage/backgroundimg4.jpg", title: "Sports Chrono" },
            { img: "/backgroundimage/backgroundimg.jpg", title: "Luxury Decade Series" },
          ].map((item, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="watch-card shadow">
                <img
                  src={item.img}
                  alt={item.title}
                  className="img-fluid"
                  style={{ height: "230px", width: "100%", objectFit: "cover" }}
                />
                <h5 className="mt-2 fw-semibold text-center">{item.title}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-dark text-light text-center py-3 mt-3">
        © 2025 Watch Store | Timeless Style ⌚
      </footer>
    </div>
  );
}
