import { useEffect, useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./order.css";
import { AppContext } from "../../AppProvider/APPContext";
export default function Userorder() {
  const [order, setOrder] = useState([]);
  const navigate = useNavigate();
  const { fetchCounts } = useContext(AppContext);
  useEffect(() => {
    fetchCounts();
    fetchOrders();
  }, [fetchCounts]);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("payments/order/items/");
      const latestorders = [...res.data].reverse();
      setOrder(latestorders);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  const getPaymentMethodLabel = (method) => {
    if (method === "cod") return "Cash On Delivery";
    if (method === "onlinepayment") return "Online Payment";
    if (method === "wallet") return "Wallet";
    return "N/A";
  };

  const getStatusLabel = (status) => {
    if (status === "completed") return "Completed";
    if (status === "pending") return "Pending";
    if (status === "failed") return "Failed";
    if (status === "refunded") return "Refunded";
    return "Processing";
  };

  const getStatusClass = (status) => {
    if (status === "completed") return "shipped";
    if (status === "pending") return "processing";
    if (status === "failed") return "canceled";
    if (status === "refunded") return "canceled";
    return "processing";
  };

  return (
    <div className="order-details-wrapper">
      <header className="page-header">
        <button
          onClick={() => navigate("/products")}
          className="btn-secondary"
          style={{ position: "absolute", left: "20px", top: "50px" }}
        >
          ← Back to Gallery
        </button>

        <h1>My Orders</h1>
        <div className="accent-line"></div>
        <p>
          Total Orders{" "}
          <span style={{ color: "#111", fontWeight: "600" }}>
            {order.length}
          </span>
        </p>
      </header>

      <div
        className="orders-container"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        {order.length > 0 ? (
          order.map((item) => (
            <div key={item.id} className="luxury-order-card">
              <div className="order-image-box">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                />
              </div>

              <div className="order-info-box">
                <div className="order-header-row">
                  <span className="order-brand">
                    {item.product_brand || "Boutique Exclusive"}
                  </span>

                  <span className={`status-badge ${getStatusClass(item.payment_status)}`}>
                    {getStatusLabel(item.payment_status)}
                  </span>
                </div>

                <h2 className="order-item-name">{item.product_name}</h2>

                <div className="order-meta-grid">
                  <div className="meta-item">
                    <label>Quantity</label>
                    <span>{item.quantity} units</span>
                  </div>

                  <div className="meta-item">
                    <label>Purchase Date</label>
                    <span>{item.order_date}</span>
                  </div>

                  <div className="meta-item">
                    <label>Unit Price</label>
                    <span className="order-price">
                      ₹{Number(item.price).toLocaleString()}
                    </span>
                  </div>

                  <div className="meta-item">
                    <label>Total Price</label>
                    <span className="order-price">
                      ₹{Number(item.total_price).toLocaleString()}
                    </span>
                  </div>

                  <div className="meta-item">
                    <label>Payment Method</label>
                    <span>{getPaymentMethodLabel(item.payment_method)}</span>
                  </div>

                  <div className="meta-item">
                    <label>Payment Status</label>
                    <span>{getStatusLabel(item.payment_status)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="loading-state">No past acquisitions found.</div>
        )}
      </div>
    </div>
  );
}