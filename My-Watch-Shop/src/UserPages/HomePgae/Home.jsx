import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const goProducts = () => navigate("/products");

  const featuredWatches = [
    { img: "/backgroundimage/backgoundimg2.jpg", title: "Royal Edition" },
    { img: "/backgroundimage/backgroundimg3.jpg", title: "Classic Men Series" },
    { img: "/backgroundimage/backgroundimg4.jpg", title: "Sports Chrono" },
    { img: "/backgroundimage/backgroundimg.jpg", title: "Luxury Decade Series" },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-wrapper">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="video/11899562-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-content text-center container">
          <p className="hero-tag" style={{ color: '#d4af37', letterSpacing: '3px' }}>LUXURY WATCH COLLECTION</p>
          <h1 className="hero-title">Timeless Elegance <br /> Crafted for Prestige</h1>
          <p className="hero-subtitle">
            Discover premium timepieces that blend precision, heritage, and luxury into every second.
          </p>
          <div className="hero-buttons mt-4">
            <button className="shop-btn" onClick={goProducts}>
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header text-center mb-5">
            <p style={{ color: '#d4af37', textTransform: 'uppercase' }}>Exclusive Range</p>
            <h2 className="display-5 fw-bold">Featured Collection</h2>
            <div className="mx-auto" style={{ width: '60px', height: '3px', background: '#d4af37' }}></div>
          </div>

          <div className="row g-4">
            {featuredWatches.map((item, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-3">
                <div className="luxury-card">
                  <div className="image-wrapper position-relative overflow-hidden">
                    <img src={item.img} alt={item.title} className="watch-image" />
                  </div>
                  <div className="p-4 text-center">
                    <h5 style={{ color: '#f5d76e' }}>{item.title}</h5>
                    <p className="small text-secondary">A premium statement piece designed for excellence.</p>
                    <button className="btn btn-outline-warning btn-sm rounded-pill mt-2" onClick={goProducts}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Banner */}
      <section className="luxury-banner">
        <div className="container text-center">
          <p className="text-warning mb-2">SINCE 2026</p>
          <h2 className="fw-bold mb-3">Where Innovation Meets Luxury</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '700px' }}>
            Every watch in our collection is chosen to reflect bold character, 
            precision engineering, and timeless design.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-luxury text-center">
        <p className="text-secondary mb-0">© 2026 Watch Store | Timeless Style ⌚</p>
      </footer>
    </div>
  );
}