import { useEffect, useState} from "react";
import "./OrderDetails.css";
import axiosInstance from "../api/axiosInstance";
import { IndianRupee } from "lucide-react";
import { AppContext } from "../AppProvider/APPContext";
export default function OrderDetails() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("orderlist/orderlist/");
        setOrders(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);
    const updatestatus=async(id,status)=>{
      try{
         await axiosInstance.patch(`orderlist/update/status/${id}/`,{
        new_status:status
      })
      setOrders((prev)=>
      prev.map((item)=>
        item.id==id? {...item,payment_status:status}:item
      )
      )
      }catch(err){
        console.log("Status update error:", err.response?.data || err.message);
      }
    }

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
              <th style={theme.th}>Order ID</th>
              <th style={theme.th}>Payment Method</th>
              <th style={theme.th}>Amount</th>
              <th style={theme.th}>Date</th>
              <th style={theme.th}>Status</th>
              <th style={theme.th}>Manage Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.id} className="ledger-row">
                <td style={theme.td}>
                  <span style={theme.clientName}>{item.user_name}</span>
                  <span style={theme.clientEmail}>{item.user_email}</span>
                </td>

                <td style={theme.td}>#{item.order_id}</td>

                <td style={theme.td}>
                  {
                  item.payment_method === "cod"
                  ? "Cash on Delivery"
                  : item.payment_method === "onlinepayment"
                  ? "Online Payment"
                  : item.payment_method === "wallet"
                  ? "Wallet"
                  : item.payment_method
                  }
                </td>

                <td style={theme.td}>
                  <span style={theme.total}>
                    <IndianRupee />{Number(item.total_amount).toLocaleString()}
                  </span>
                </td>

                <td style={{ ...theme.td, color: "#777", fontSize: "12px" }}>
                  {item.created_at}
                </td>
                <td style={theme.td}>
                  {item.payment_status =="pending"&&(<>
                    <span style={{color:"grey",fontWeight:800,fontSize:"17px"}}>{item.payment_status}</span>
                  </>)}
                  {item.payment_status =="completed"&&(<>
                    <span style={{color:"#79AE6F",fontWeight:800,fontSize:"17px"}}>{item.payment_status}</span>
                  </>)}
                  {item.payment_status =="failed"&&(<>
                    <span style={{color:"#AE2448",fontWeight:800,fontSize:"17px"}}>{item.payment_status}</span>
                  </>)}
                  {item.payment_status =="refunded"&&(<>
                    <span style={{color:"#72BAA9",fontWeight:800,fontSize:"17px"}}>{item.payment_status}</span>
                  </>)}
                </td>
                <td style={theme.td}>
                  <select 
                  value={item.payment_status}
                  onChange={(e)=>updatestatus(item.id, e.target.value)}>
                    <option value="pending" style={{color:"grey",fontWeight:800,fontSize:"17px"}}>PENDING</option>
                    <option value="completed" style={{color:"#79AE6F",fontWeight:800,fontSize:"17px"}}>COMPLETED</option>
                    <option value="failed" style={{color:"#AE2448",fontWeight:800,fontSize:"17px"}}>FAILED</option>
                    <option value="refunded" style={{color:"#72BAA9",fontWeight:800,fontSize:"17px"}}>REFUNDED</option>
                  </select>
                  <span 
                  >
                  </span>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
