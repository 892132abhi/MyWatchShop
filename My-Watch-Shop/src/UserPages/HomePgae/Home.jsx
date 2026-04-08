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
      <section className="hero-wrapper">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="video/11899562-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-content text-center">
          <p className="hero-tag">Luxury Watch Collection</p>
          <h1 className="hero-title">
            Timeless Elegance <br />
            Crafted for Prestige
          </h1>
          <p className="hero-subtitle">
            Discover premium timepieces that blend precision, heritage, and
            luxury into every second.
          </p>
          <div className="hero-buttons">
            <button className="shop-btn" onClick={goProducts}>
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-tag">Exclusive Range</p>
            <h2 className="section-title">Featured Collection</h2>
            <div className="gold-line"></div>
          </div>

          <div className="row g-4 mt-2">
            {featuredWatches.map((item, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-3">
                <div className="luxury-card">
                  <div className="image-wrapper">
                    <img src={item.img} alt={item.title} className="watch-image" />
                    <div className="card-overlay">
                      <button className="view-btn" onClick={goProducts}>
                        View More
                      </button>
                    </div>
                  </div>
                  <div className="card-body-custom">
                    <h5 className="watch-title">{item.title}</h5>
                    <p className="watch-desc">
                      A premium statement piece designed for those who value style and excellence.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-banner">
        <div className="container text-center">
          <p className="banner-tag">Since 2026</p>
          <h2>Where Innovation Meets Luxury</h2>
          <p className="mx-auto" style={{ maxWidth: '800px' }}>
            Every watch in our collection is chosen to reflect bold character,
            precision engineering, and timeless design.
          </p>
        </div>
      </section>

      <footer className="footer-luxury text-center">
        <p>© 2026 Watch Store | Timeless Style ⌚</p>
      </footer>
    </div>
  );
}