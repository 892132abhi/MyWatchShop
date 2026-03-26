import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './order.css'; // Utilizing your luxury CSS

export default function Userorder() {
    const [order, setOrder] = useState([]);
    const [status, setStatus] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const log = JSON.parse(localStorage.getItem("loggeduser"));
        if (!log) return;
        
        axios.get(`http://localhost:3000/users/${log.id}`)
            .then(res => {
             
                setStatus(res.data.active);
                const userOrders = res.data.orders || [];
                const latestorders = [...userOrders].reverse()
                setOrder(latestorders);
            })
            .catch(err => console.error("Fetch error:", err));
    }, []); // Empty dependency array to prevent infinite loops

    return (
        <div className="order-details-wrapper">
            <header className="page-header">
                <button 
                    onClick={() => navigate("/products")} 
                    className="btn-secondary" 
                    style={{ position: 'absolute', left: '20px', top: '50px' }}
                >
                    ← Back to Gallery
                </button>
                <h1>My Orders</h1>
                <div className="accent-line"></div>
                <p>Total Orders <span style={{ color: '#111', fontWeight: '600' }}>{order.length|0}</span></p>
            </header>

            <div className="orders-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {order.length > 0 ? (
                    order.map((item, index) => (
                        <div key={index} className="luxury-order-card">
                            <div className="order-image-box">
                                <img src={item.item.image} alt={item.item.name} />
                            </div>

                            <div className="order-info-box">
                                <div className="order-header-row">
                                    <span className="order-brand">{item.item.brand || "Boutique Exclusive"}</span>
                                    <span className={`status-badge ${status ? 'shipped' : 'canceled'}`}>
                                        {status ? "Shipped" : "Processing"}
                                    </span>
                                </div>
                                
                                <h2 className="order-item-name">{item.item.name}</h2>
                                
                                <div className="order-meta-grid">
                                    <div className="meta-item">
                                        <label>Quantity</label>
                                        <span>{item.item.quantity} units</span>
                                    </div>
                                    <div className="meta-item">
                                        <label>Purchase Date</label>
                                        <span>{item.date}</span>
                                    </div>
                                    <div className="meta-item">
                                        <label>Valuation</label>
                                        <span className="order-price">₹{item.item.price.toLocaleString()}</span>
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