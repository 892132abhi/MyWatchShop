import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import './editproduct.css'; // Using the same luxury CSS file

export default function EditProducts() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [items, setItems] = useState(null);
    const [names, setNames] = useState("");
    const [types, setTypes] = useState("");
    const [brands, setBrands] = useState("");
    const [prices, setPrices] = useState("");
    const [images, setImages] = useState("");
    const [descriptions, setDescriptions] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/products/${id}`);
                const data = res.data;
                setItems(data);
                setNames(data.name);
                setTypes(data.type);
                setBrands(data.brand);
                setPrices(data.price);
                setImages(data.image);
                setDescriptions(data.description);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchData();
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: "Save changes to this item?",
            text: "The product gallery will be updated immediately.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Update Product",
            cancelButtonText: "Discard",
            confirmButtonColor: "#1a1a1a", // Dark luxury button
            cancelButtonColor: "#eee",
            customClass: {
                confirmButton: 'luxury-confirm-btn',
                cancelButton: 'luxury-cancel-btn'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.put(`http://localhost:3000/products/${id}`, {
                        name: names,
                        type: types,
                        brand: brands,
                        price: Number(prices),
                        image: images,
                        description: descriptions
                    });
                    
                    await Swal.fire({
                        title: "Updated",
                        text: "Product details synchronized successfully.",
                        icon: "success",
                        confirmButtonColor: "#d4af37"
                    });
                    navigate("/adminproducts");
                } catch (err) {
                    Swal.fire("Error", "Could not update the product.", "error");
                }
            }
        });
    };

    if (!items) return <div className="loading-state">Authenticating Product Data...</div>;

    return (
        <div className="order-details-wrapper">
            <header className="page-header">
                <h1>Edit Product</h1>
                <div className="accent-line"></div>
                <p>Refine inventory details and market valuation</p>
            </header>

            <div className="form-card-container">
                <form onSubmit={submit} className="luxury-form">
                    <div className="form-group">
                        <label>Product Title</label>
                        <input type="text" value={names} onChange={(e) => setNames(e.target.value)} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Collection / Type</label>
                            <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Maison / Brand</label>
                            <input type="text" value={brands} onChange={(e) => setBrands(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Valuation (₹)</label>
                        <input type="number" value={prices} onChange={(e) => setPrices(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Imagery URL</label>
                        <input type="text" value={images} onChange={(e) => setImages(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows="4" value={descriptions} onChange={(e) => setDescriptions(e.target.value)} />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate("/adminproducts")} className="btn-secondary">
                            Back to Collection
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