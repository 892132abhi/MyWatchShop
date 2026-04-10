import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus, Edit3, Trash2, PackageSearch, IndianRupee } from "lucide-react";
import "./adminproducts.css";
import axiosInstance from "../api/axiosInstance";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("products/");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Remove from Catalog?",
      text: `Are you sure you want to delete ${item.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1a1a1a",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`admin/products/delete/${item.id}/`);

      setProducts((prev) => prev.filter((p) => p.id !== item.id));

      Swal.fire("Deleted", "Product has been removed.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Delete Failed",
        err.response?.data?.message || "Could not delete product.",
        "error"
      );
    }
  };

  return (
    <div className="admin-products-wrapper">
      <header className="products-header">
        <div className="header-text">
          <h1>Inventory</h1>
          <p>{products.length} Masterpieces in Catalog</p>
        </div>

        <button
          className="add-product-btn animate__animated animate__fadeIn"
          onClick={() => navigate("/addproducts")}
        >
          <Plus size={18} /> Add New Product
        </button>
      </header>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((item) => (
            <div key={item.id} className="product-admin-card animate__animated animate__fadeIn">
              <div className="image-wrapper animate__animated animate__fadeIn">
                <img src={item.image} alt={item.name} />
                <div className="card-overlay">
                  <button
                    className="edit-icon-btn"
                    onClick={() => navigate(`/editproducts/${item.id}`)}
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    className="delete-icon-btn"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="product-info animate__animated animate__fadeIn">
                <span className="brand-label">{item.brand}</span>
                <h3 className="product-title">{item.name}</h3>
                <p className="product-price">
                  <IndianRupee />{Number(item.price).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <PackageSearch size={48} />
            <p>No products found in the vault.</p>
          </div>
        )}
      </div>
    </div>
  );
}