import { useEffect, useState,useContext } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import "animate.css";
import { AppContext } from "../../AppProvider/APPContext";
import { IndianRupee } from "lucide-react";
export default function Wishlist() {
  const [wishlists, setWishlists] = useState([]);
  const navigate = useNavigate();
  const{ fetchCounts }=useContext(AppContext)
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) {
      Swal.fire({
        title: "Identify Yourself",
        text: "Please login to access your  collection.",
        icon: "info",
        confirmButtonColor: "#000",
      }).then(() => navigate("/login"));
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`products/wishlist/`);
        setWishlists(response.data || []);
      } catch (err) {
        console.error("Fetch error:", err.response?.data||err.message);
      }
    };

    fetchData();
  }, [token,navigate]);

const addToCart = async (item) => {
  try {
    const res = await axiosInstance.post("products/cart/add/", {
      product_id: item.product_id,
      quantity: 1,
    });

    fetchCounts();

    toast.success(res.data.message || "Added to cart", {
      position: "top-left",
      autoClose: 800,
    });

    // optional: go to cart page after adding
    navigate("/cart");
  } catch (err) {
    console.error("Cart error:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Failed to add to cart", {
      position: "top-left",
      autoClose: 800,
    });
  }
};

  const Remove = async (item) => {
    try {
     await axiosInstance.delete(`products/wishlist/remove/`, {
      data:{
        product_id:item.product_id
      }
      });
      fetchCounts();
      toast.success("removed from Wishlist",{
        position:"top-left",
        autoClose:500
      })
      
      setWishlists((prevWishlist) => 
      prevWishlist.filter((wish) => wish.id !== item.id))

    } catch (err) {
      console.error("Remove error:", err.response?.data||err.message);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <header style={styles.header} className="animate__animated animate__fadeIn">
        <h1 style={styles.mainTitle}>Your Collection</h1>
        <p style={styles.subTitle}>{wishlists.length} Items reserved for you</p>
      </header>

      <div style={styles.grid}>
        {wishlists.map((item) => (
          <div key={item.id} style={styles.card} className="animate__animated animate__fadeIn">
            <div style={styles.imageContainer}>
              <img src={item.image} alt={item.name} style={styles.image} />
              <button 
                onClick={() => Remove(item)} 
                style={styles.floatingRemove}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.content}>
              <h3 style={styles.itemDescription}>{item.name}</h3>
              <div style={styles.footer}>
                <span style={styles.priceTag}><IndianRupee />{item.price.toLocaleString()}</span>
                
                <button onClick={() => addToCart(item)} style={styles.actionBtn}>
                  Addtocart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlists.length === 0 && (
        <div style={styles.emptyState} className="animate__animated animate__fadeIn">
          <h2 style={{fontFamily: "'Playfair Display', serif"}}>Your wishlist is empty</h2>
          <button onClick={() => navigate("/products")} style={styles.browseBtn}>Explore Products</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageBackground: {
    padding: "60px 8%",
    backgroundColor: "#fcfbf9", 
    minHeight: "100vh",
    fontFamily: "'Montserrat', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "50px",
  },
  mainTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.8rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0",
  },
  subTitle: {
    color: "#888",
    fontSize: "1.1rem",
    marginTop: "10px",
    letterSpacing: "1px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "40px",
  },
  card: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    transition: "transform 0.3s ease",
    border: "1px solid #eee",
  },
  imageContainer: {
    position: "relative",
    height: "300px",
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  floatingRemove: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.3s",
  },
  content: {
    padding: "20px",
  },
  itemDescription: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 15px 0",
    height: "2.8em",
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f8f8f8",
    paddingTop: "15px",
  },
  /* --- YOUR LUXURY PRICE DESIGN --- */
  priceTag: {
    color: "#d4af37", 
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  actionBtn: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "10px",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "0.3s",
  },
  emptyState: {
    textAlign: "center",
    marginTop: "100px",
    color: "#ccc",
  },
  browseBtn: {
    marginTop: "20px",
    padding: "12px 30px",
    borderRadius: "2px",
    border: "1px solid #1a1a1a",
    backgroundColor: "transparent",
    textTransform: "uppercase",
    fontSize: "11px",
    letterSpacing: "2px",
    cursor: "pointer",
  }
};