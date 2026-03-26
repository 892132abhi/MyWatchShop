import axios from "axios";
import { useEffect, useState } from "react";
import './OrderDetails.css'; // Ensure your CSS file is imported

export default function OrderDetails() {
  const [order, setorder] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/order");
        setorder(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- REFINED LUXURY DESIGN THEME (PILL FUNCTION REMOVED) ---
  const theme = {
    container: {
      backgroundColor: "#fcfbf9",
      minHeight: "100vh",
      padding: "60px 20px",
      fontFamily: "'Montserrat', sans-serif",
      color: "#1a1a1a",
    },
    header: {
      textAlign: "center",
      marginBottom: "50px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "2.8rem",
      fontWeight: "700",
      margin: "0",
      color: "#111",
    },
    subtitle: {
      textTransform: "uppercase",
      letterSpacing: "5px",
      fontSize: "11px",
      color: "#d4af37",
      marginTop: "10px",
      fontWeight: "600",
    },
    tableWrapper: {
      maxWidth: "1100px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      border: "1px solid #eee",
      boxShadow: "0 20px 50px rgba(0,0,0,0.03)",
      maxHeight: "65vh",
      overflowY: "auto",
      overflowX: "hidden",
      borderRadius: "4px",
      position: "relative",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
    },
    thead: {
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    th: {
      padding: "18px 25px",
      fontSize: "10px",
      textTransform: "uppercase",
      letterSpacing: "2px",
      fontWeight: "600",
    },
    td: {
      padding: "22px 25px",
      borderBottom: "1px solid #f9f9f9",
      fontSize: "14px",
    },
    clientName: {
      display: "block",
      fontWeight: "600",
      color: "#111",
    },
    clientEmail: {
      fontSize: "11px",
      color: "#999",
    },
    brand: {
      fontFamily: "'Playfair Display', serif",
      fontStyle: "italic",
      color: "#d4af37",
      fontWeight: "700",
      fontSize: "14px",
      marginRight: "8px",
    },
    total: {
      fontWeight: "700",
      fontSize: "16px",
    },
  };

  return (
    <div style={theme.container} className="boutique-admin-theme">
      <header style={theme.header}>
        <h1 style={theme.title}>Order Ledger</h1>
        <div className="accent-line"></div>
        <p style={theme.subtitle}>Private Transaction History</p>
      </header>

      <div style={theme.tableWrapper} className="ledger-table-wrapper">
        <table style={theme.table} className="boutique-table">
          <thead style={theme.thead}>
            <tr>
              <th style={theme.th}>Client</th>
              <th style={theme.th}>Product Details</th>
              <th style={theme.th}>Valuation</th>
              <th style={theme.th}>Date</th>
              <th style={theme.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {order.map((oitem, oindex) =>
              oitem.orders?.map((uitem, uindex) => (
                <tr key={`${oindex}-${uindex}`} className="ledger-row">
                  <td style={theme.td}>
                    <span style={theme.clientName}>{oitem.name}</span>
                    <span style={theme.clientEmail}>{oitem.email}</span>
                  </td>
                  <td style={theme.td}>
                    <span style={theme.brand}>{uitem.item.brand}</span>
                    <span style={{ color: "#444" }}>{uitem.item.name}</span>
                    <span className="i-qty">Quantity: {uitem.item.quantity}</span>
                  </td>
                  <td style={theme.td}>
                    <span style={theme.total}>
                      ₹{(uitem.item.price * uitem.item.quantity).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ ...theme.td, color: "#777", fontSize: "12px" }}>
                    {uitem.date}
                  </td>
                  <td style={theme.td}>
                    {/* Updated to use CSS classes only */}
                    <span className={`pill ${oitem.status ? 'pill-shipped' : 'pill-void'}`}>
                      {oitem.status ? "Shipped" : "Canceled"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}