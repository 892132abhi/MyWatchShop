import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const [wishlists, setWishlists] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggeduser"));

  useEffect(() => {
    if (!user) {
      Swal.fire({
        title: "Identify Yourself",
        text: "Please login to access your curated collection.",
        icon: "info",
        confirmButtonColor: "#000",
      }).then(() => navigate("/login"));
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users/${user.id}`);
        setWishlists(response.data.wishlist || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [user, navigate]);

  const payment = (item) => {
    localStorage.setItem("purchase-item", JSON.stringify(item));
    navigate("/payment");
  };

  const Remove = async (item) => {
    const updatedWishlist = wishlists.filter((i) => i.id !== item.id);
    try {
      setWishlists(updatedWishlist);
      await axios.patch(`http://localhost:3000/users/${user.id}`, {
        wishlist: updatedWishlist,
      });
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Your Collection</h1>
        <p style={styles.subTitle}>{wishlists.length} Items reserved for you</p>
      </header>

      <div style={styles.grid}>
        {wishlists.map((item) => (
          <div key={item.id} style={styles.card}>
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
              <h3 style={styles.itemDescription}>{item.description}</h3>
              <div style={styles.footer}>
                {/* Applied your specific Luxury Price styling here */}
                <span style={styles.priceTag}>₹{item.price.toLocaleString()}</span>
                
                <button onClick={() => payment(item)} style={styles.actionBtn}>
                  Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlists.length === 0 && (
        <div style={styles.emptyState}>
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
    backgroundColor: "#fcfbf9", // Soft luxury off-white
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