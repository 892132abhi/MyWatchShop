import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import 'bootstrap/dist/css/bootstrap.min.css';
import './addpr.css';

export default function AddProducts() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Confirm New Product?",
      text: `Are you sure you want to add "${name}" to the inventory?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Add Product",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1a1a1a", // Luxury Black
      cancelButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post("http://localhost:3000/products", {
            name,
            type,
            brand,
            price,
            image: `/Watches/images/${image.split('\\').pop()}`, // Cleaner file handling
            description,
          });

          Swal.fire("Success", "Inventory Updated Successfully", "success");
          
          // Clear form
          setName(""); setType(""); setBrand(""); 
          setPrice(""); setImage(""); setDescription("");
        } catch (error) {
          Swal.fire("Error", "Could not connect to database", "error");
        }
      }
    });
  };

  return (
    <div className="admin-page-bg">
      <div className="admin-form-container">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>ADD NEW PRODUCT</h2>
            {/* <p>Enter details to curate a new collection piece</p> */}
          </div>

          <form onSubmit={submit} className="admin-form">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="admin-label">Product Name</label>
                <input type="text" className="admin-input" placeholder="e.g. Submariner Date" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Watch Type</label>
                <input type="text" className="admin-input" placeholder="e.g. Automatic" value={type} onChange={(e) => setType(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Brand Name</label>
                <input type="text" className="admin-input" placeholder="e.g. Rolex" value={brand} onChange={(e) => setBrand(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="admin-label">Price (INR)</label>
                <input type="number" className="admin-input" placeholder="e.g. 850000" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>

              <div className="col-12">
                <label className="admin-label">Media Attachment</label>
                <div className="file-upload-wrapper">
                  <input type="file" className="admin-input-file" onChange={(e) => setImage(e.target.value)} />
                  <span className="file-custom">
                    {image ? image.split('\\').pop() : "Choose image file..."}
                  </span>
                </div>
              </div>

              <div className="col-12">
                <label className="admin-label">Product Narrative</label>
                <textarea className="admin-input admin-textarea" placeholder="Describe the  features..." value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
            </div>

            <div className="admin-action-area">
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