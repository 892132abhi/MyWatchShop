import axios from "axios";
import { useEffect, useState } from "react";
import './new.css';
import { Ban, Package, UserCheck2, Users, TrendingUp, DollarSign } from "lucide-react";

export default function DashBoard() {
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState([]);
  const [active, setActive] = useState([]);
  const [noActive, setNoActive] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/order");
        setOrder(res.data);
        const u = await axios.get("http://localhost:3000/users");
        setUser(u.data);
        setActive(u.data.filter((i) => i.active === true));
        setNoActive(u.data.filter((w) => w.active === false));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Total Revenue
  const totalRevenue = order.reduce((acc, curr) => {
    const orderTotal = curr.orders?.reduce((sum, item) => sum + (item.item.price * item.item.quantity), 0) || 0;
    return acc + orderTotal;
  }, 0);

  const latestOrders = order.slice(-3).reverse();

  return (
    <div className="dashboard-wrapper">
      <header className="db-header">
        <div>
          <h1>Executive Overview</h1>
          <p>Real-time analytics & performance tracking</p>
        </div>
        <div className="revenue-badge">
          <DollarSign size={16} />
          <span>Total Revenue: ₹{totalRevenue.toLocaleString()}</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders"><Package size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{order.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Clients</p>
            <h3 className="stat-value">{user.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active"><UserCheck2 size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Active Now</p>
            <h3 className="stat-value">{active.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blocked"><Ban size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Restricted</p>
            <h3 className="stat-value">{noActive.length}</h3>
          </div>
        </div>
      </div>

      <section className="recent-activity">
        <div className="section-title">
          <TrendingUp size={20} />
          <h2>Recent Acquisitions</h2>
        </div>
        
        <div className="db-table-container">
          <table className="db-luxury-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((oitem, oidx) => (
                oitem.orders?.map((item, idx) => (
                  <tr key={`${oidx}-${idx}`}>
                    <td className="font-semibold">{oitem.name}</td>
                    <td className="product-name">{item.item.name}</td>
                    <td>₹{item.item.price.toLocaleString()}</td>
                    <td>{item.item.quantity}</td>
                    <td className="revenue-text">₹{(item.item.price * item.item.quantity).toLocaleString()}</td>
                    <td>
                      <span className={`db-status ${oitem.status ? 'shipped' : 'pending'}`}>
                        {oitem.status ? "Shipped" : "Processing"}
                      </span>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}