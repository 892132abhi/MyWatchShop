import { useState } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./addpr.css";
import axiosInstance from "../api/axiosInstance";

export default function AddProducts() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Confirm New Product?",
      text: `Are you sure you want to add "${name}" to the inventory?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Add Product",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1a1a1a",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("brand", brand);
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("description", description);

      if (image) {
        formData.append("image", image);
      }

      await axiosInstance.post("admin/products/addproduct/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await Swal.fire("Success", "Inventory Updated Successfully", "success");

      setName("");
      setType("");
      setBrand("");
      setPrice("");
      setQuantity("");
      setImage(null);
      setDescription("");
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Could not add product",
        "error"
      );
    }
  };

  return (
    <div className="admin-page-bg">
      <div className="admin-form-container">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>ADD NEW PRODUCT</h2>
          </div>

          <form onSubmit={submit} className="admin-form">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="admin-label">Product Name</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Submariner Date"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Watch Type</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Automatic"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Brand Name</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Rolex"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Price (INR)</label>
                <input
                  type="number"
                  className="admin-input"
                  placeholder="850000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Quantity</label>
                <input
                  type="number"
                  className="admin-input"
                  placeholder="Add quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="admin-label">Media Attachment</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    className="admin-input-file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <span className="file-custom">
                    {image ? image.name : "Choose image file..."}
                  </span>
                </div>
              </div>

              <div className="col-12">
                <label className="admin-label">Product Narrative</label>
                <textarea
                  className="admin-input admin-textarea"
                  placeholder="Describe the features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-action-area animate__animated animate__fadeIn">
              <button type="submit" className="admin-submit-btn">
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}