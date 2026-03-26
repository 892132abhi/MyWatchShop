import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import './ProductDetail.css'; // Import the new CSS

export default function ProductsDetails() {
  const [items, setItems] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const log = JSON.parse(localStorage.getItem("loggeduser"));

  useEffect(() => {
    if (!log) {
      Swal.fire({
        title: "Access Denied",
        text: "Please sign in to view details.",
        icon: "warning",
        confirmButtonColor: "#d4af37",
      });
      navigate("/login");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/users/${log.id}`);
        if (!res.data.active) {
          Swal.fire({
            title: "Account Restricted",
            text: "Your account has been disabled by admin.",
            icon: "error",
          });
          navigate("/login");
        }
      } catch (err) { console.error(err); }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5s instead of 1.5s for performance
    return () => clearInterval(interval);
  }, [id, log, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:3000/products/${id}`);
      setItems(res.data);
    };
    fetchData();
  }, [id]);

  if (!items) return <div className="loading-state">Refining details...</div>;

  const Purchase = async (item) => {
    try {
      const res = await axios.get(`http://localhost:3000/users/${log.id}`);
      const currentuser = res.data;
      const alreadyincart = currentuser.cart.some((cartitem) => cartitem.id === item.id);

      if (alreadyincart) {
        Swal.fire({
          title: "Already in Collection",
          text: "This piece is already in your cart.",
          icon: "info",
          confirmButtonColor: "#d4af37",
        });
      } else {
        await axios.patch(`http://localhost:3000/users/${log.id}`, {
          cart: [...currentuser.cart, item],
        });
        Swal.fire({
          title: "Added to Cart",
          text: `${item.brand} has been added to your selection.`,
          icon: "success",
          confirmButtonColor: "#1a1a1a",
        });
      }
    } catch (err) { console.log("Error", err); }
  };

  return (
    <div className="details-container">
      <div className="details-card">
        {/* Left Side: Image */}
        <div className="details-image-section">
          <img src={items.image} alt={items.name} />
        </div>

        {/* Right Side: Content */}
        <div className="details-info-section">
          <div className="brand-badge">Premium Collection</div>
          <h1 className="details-brand">{items.brand}</h1>
          <h2 className="details-description">{items.description}</h2>
          
          <div className="details-price">
            <span className="currency">₹</span>
            {items.price.toLocaleString()}
          </div>

          <div className="details-actions">
            <button className="add-to-cart-btn" onClick={() => Purchase(items)}>
              Add to selection
            </button>
            <p className="shipping-info">Complimentary Standard Shipping & Returns</p>
          </div>
        </div>
      </div>
    </div>
  );
}