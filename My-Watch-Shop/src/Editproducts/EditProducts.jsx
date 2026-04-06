import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./editproduct.css";
import axiosInstance from "../api/axiosInstance";

export default function EditProducts() {
  const navigate = useNavigate();
  const { id } = useParams();



  const [items, setItems] = useState(null);
  const [names, setNames] = useState("");
  const [types, setTypes] = useState("");
  const [brands, setBrands] = useState("");
  const [prices, setPrices] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState(null);
  const [descriptions, setDescriptions] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`admin/products/singleproduct/${id}/`);
        const data = res.data;

        setItems(data);
        setNames(data.name || "");
        setTypes(data.type || "");
        setBrands(data.brand || "");
        setPrices(data.price || "");
        setQuantity(data.quantity || 0);
        setDescriptions(data.description || "");
        
        // Fix: Ensure the initial image from the server is visible
        if (data.image) {
  setPreview(data.image);
} else {
  setPreview(null);
}
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: "Save changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Update Product",
      confirmButtonColor: "#1a1a1a",
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("name", names);
      formData.append("type", types);
      formData.append("brand", brands);
      formData.append("price", prices);
      formData.append("quantity", quantity);
      formData.append("description", descriptions);
      if (images) formData.append("image", images);

      await axiosInstance.put(`admin/products/editproduct/${id}/`, formData, {
        // headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire("Updated", "Product updated successfully", "success");
      navigate("/adminproducts");
    } catch (err) {
      Swal.fire("Error", "Could not update product", err);
    }
  };

  if (!items) return <div className="loading-state">Loading Product...</div>;

  return (
    <div className="order-details-wrapper">
      <header className="page-header">
        <h1>Edit Product</h1>
        <div className="accent-line"></div>
        <p>Refine inventory details and market valuation</p>
      </header>

      <div className="form-card-container">
        <form onSubmit={submit} className="luxury-form">
          
          {/* PRODUCT IMAGE CARD PREVIEW */}
          <div className="form-group">
            <label>Current Visual</label>
            <div className="product-preview-card">
              {preview ? (
                <img src={preview} alt="Product" />
              ) : (
                <div className="no-image-placeholder">No Image Available</div>
              )}
              <div className="card-overlay">
                <span>{brands || "Product"}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Product Title</label>
            <input type="text" value={names} onChange={(e) => setNames(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input type="text" value={brands} onChange={(e) => setBrands(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" value={prices} onChange={(e) => setPrices(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Change Product Image</label>
            <input type="file"  onChange={handleImageChange} className="file-input-styled" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows="4" value={descriptions} onChange={(e) => setDescriptions(e.target.value)} />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/adminproducts")} className="btn-primary">
              Back
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}