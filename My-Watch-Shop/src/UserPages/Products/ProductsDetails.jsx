import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./productdetail.css";
import axiosInstance from "../../api/axiosInstance";
import { AppContext } from "../../AppProvider/APPContext";
import { toast } from "react-toastify";
export default function ProductsDetails() {
  const [items, setItems] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("access");
  const { fetchCounts } = useContext(AppContext);

  useEffect(() => {
    if (!token) {
      Swal.fire({
        title: "Access Denied",
        text: "Please sign in to view details.",
        icon: "warning",
        confirmButtonColor: "#d4af37",
      }).then(() => navigate("/login"));
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await axiosInstance.get("/profile/");
        if (!res.data.is_active) {
          Swal.fire({
            title: "Account Restricted",
            text: "Your account has been disabled by admin.",
            icon: "error",
          }).then(() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("loggeduser");
            navigate("/login");
          });
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    checkStatus();
  }, [token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`products/productview/${id}/`);
        setItems(res.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchData();
  }, [id]);

  const Purchase = async (item) => {
    try {
      const res = await axiosInstance.post("products/cart/add/", {
        product_id: item.id,
      });

      fetchCounts();

      Swal.fire({
        title: "Added to Cart",
        text: res.data.message || `${item.brand} has been added to your selection.`,
        icon: "success",
        confirmButtonColor: "#1a1a1a",
      });
      if (res.data.message=="Product quantity increased"){
            toast.success("Product quantity increased",{
              position:"top-left",
              autoClose:1000,
      });
    }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Unable to add item to cart.",
        icon: "error",
        confirmButtonColor: "#d4af37",
      });
    }
  };

  if (!items) return <div className="loading-state">please wait...</div>;

  return (
    <div className="details-container">
      <div className="details-card">
        <div className="details-image-section">
          <img src={items.image} alt={items.name} />
        </div>

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
            <p className="shipping-info">
              Complimentary Standard Shipping & Returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}