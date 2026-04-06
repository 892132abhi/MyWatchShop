import { useEffect, useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Trash, Undo2, ShoppingBag, CheckSquare, Square, IndianRupee } from "lucide-react";
import './cart.css';
import { toast } from 'react-toastify';
import axiosInstance from "../../api/axiosInstance";
import { AppContext } from "../../AppProvider/APPContext";
export default function Cart() {
  const [cartItems, SetCartItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]); // New State for Checkboxes
  const navigate = useNavigate();
  const {fetchCounts} =useContext(AppContext)
  // 1. Security Check: Admin Block/Active Status
  useEffect(() => {
    const checkuser = async () => {
      const token = localStorage.getItem('access');
      if (!token) return;
      try {
        const res = await axiosInstance.get("/accounts/profile/");
        if (!res.data.is_active) {
          Swal.fire({
            icon: "error",
            text: "Admin Blocked You",
            showConfirmButton: false
          }).then(() => {
            localStorage.removeItem('access');
            navigate("/");
          });
        }
      } catch (err) {
        console.log("Profile Error", err.response?.data || err.message);
        localStorage.removeItem('access');
        navigate("/login");
      }
    };
    checkuser();
  }, [navigate]);

  // 2. Fetch Cart Data
  useEffect(() => {
    const fetchcart = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await axiosInstance.get("/products/cart/");
        SetCartItems(res.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };
    fetchcart();
  }, [navigate]);

  // 3. Selection Logic Functions
  const handleSelect = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId) // Uncheck
        : [...prev, productId] // Check
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]); // Deselect All
    } else {
      setSelectedItems(cartItems.map(item => item.product_id)); // Select All
    }
  };

  // 4. Calculate Totals
  useEffect(() => {
    // Total of ONLY selected items
    const total = cartItems
      .filter(item => selectedItems.includes(item.product_id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    setAmount(total);
  }, [cartItems, selectedItems]);

  const back = () => {
    navigate('/products');
  };

  // 5. Update Quantity in PostgreSQL
  const UpdateQuantity = async (items, newQuantity) => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate("/login");
      return;
    }
    if (newQuantity < 1) return;
    try {
      
      const res = await axiosInstance.patch(`/products/cart/update/`, {
        product_id: items.product_id,
        quantity: newQuantity
      });

      SetCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem.product_id === items.product_id
            ? { ...cartItem, quantity: res.data.quantity }
            : cartItem
        )
      );
      toast.success("Quantity updated", { position:"top-left",autoClose: 800 });
    } catch (err) {
      console.log("error found : ", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
      }
    }
  };

  // 6. Remove Item from PostgreSQL
  const Remove = async (items) => {
    try {
      await axiosInstance.post(`products/cart/remove/`, {
        product_id: items.product_id,
      });
      fetchCounts();
      const updatecart = cartItems.filter(
        (cartItem) => cartItem.product_id !== items.product_id
      );
      SetCartItems(updatecart);
      // Also remove from selectedItems if it was checked
      setSelectedItems(prev => prev.filter(id => id !== items.product_id));

      Swal.fire({
        title: `Item deleted from cart!`,
        icon: "success",
        iconColor: "blue",
        color: "red",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        if (updatecart.length === 0) {
          navigate("/products");
        }
      });
    } catch (err) {
      console.log("error found", err);
    }
  };

  // 7. Payment Handling (Individual & Bulk)
  const payment = (items) => {
    localStorage.setItem("purchase-type", "single");
    localStorage.setItem("purchase-item", JSON.stringify(items));
    navigate("/payment");
  };

  const bulkPayment = () => {
    if (selectedItems.length === 0){
      return Swal.fire("Empty Selection", "Please select items to checkout", "info");
    }
    const itemsToBuy = cartItems.filter(item => selectedItems.includes(item.product_id));
    localStorage.setItem("purchase-type", "bulk");
    localStorage.setItem("purchase-items", JSON.stringify(itemsToBuy));
    localStorage.setItem("total-amount", amount);
    navigate("/payment");
  };

  return (
    <>
      <header className="cart-header">
        <button onClick={back} className="back-btn-luxury">
          <Undo2 size={18} /> SEE PRODUCTS
        </button>

        <div className="total-summary">
          <h3>SELECTED INVESTMENT: <span>₹{amount?.toLocaleString()}</span></h3>
        </div>

        {cartItems.length < 1 ? (
          <button className="btn-purchase" onClick={() => navigate("/products")}>
            START SHOPPING
          </button>
        ) : (
          <button 
            className="btn-purchase" 
            onClick={bulkPayment}
            disabled={selectedItems.length === 0}
            style={{ opacity: selectedItems.length === 0 ? 0.6 : 1 }}
          >
            CHECKOUT SELECTED ({selectedItems.length})
          </button>
        )}
      </header>

      <main className="cart-container">
        {/* Select All Toggle */}
        {cartItems.length > 0 && (
          <div className="select-all-bar" onClick={toggleSelectAll} style={{ cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee' }}>
            {selectedItems.length === cartItems.length ? <CheckSquare size={20} color="#d4af37" /> : <Square size={20} />}
            <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>SELECT ALL ITEMS</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart animate__animated animate__fadeIn">
            <Trash size={80} strokeWidth={1} />
            <h2>The collection is empty.</h2>
          </div>
        ) : (
          cartItems.map((items, index) => (
            <div key={index} className="cart-item-row animate__animated animate__fadeInUp">
              
              {/* 1. Checkbox & Image */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <input 
                  type="checkbox" 
                  className="luxury-checkbox" 
                  checked={selectedItems.includes(items.product_id)}
                  onChange={() => handleSelect(items.product_id)}
                />
                <div className="cart-img-wrapper">
                  <img src={items.image} alt={items.name} />
                </div>
              </div>

              
              <div className="cart-info">
                <h2>{items.name}</h2>
                <p style={{ color: '#888', fontSize: '13px' }}>{items.brand}</p>
                <p className="pricep"><IndianRupee />{(items.price * items.quantity).toLocaleString()}</p>
              </div>

              
              <div className="counting">
                <p style={{ fontSize: '10px', letterSpacing: '1px', marginBottom: '5px' }}>QUANTITY</p>
                <div className="luxury-qty">
                  <button onClick={() => UpdateQuantity(items, items.quantity - 1)}>-</button>
                  <input type="number" value={items.quantity} readOnly />
                  <button onClick={() => UpdateQuantity(items, items.quantity + 1)}>+</button>
                </div>
              </div>

              <div className="cart-actions">
                <button className="btn-purchase" onClick={() => payment(items)}>
                  PURCHASE <ShoppingBag size={14} />
                </button>
                <button className="btn-remove" onClick={() => Remove(items)}>
                  REMOVE <Trash size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </main>
    </>
  );
}