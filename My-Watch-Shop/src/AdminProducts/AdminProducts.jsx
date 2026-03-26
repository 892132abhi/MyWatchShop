import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus, Edit3, Trash2, PackageSearch } from "lucide-react";
import './adminproducts.css';

export default function AdminProducts() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/products`);
                setProducts(res.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (item) => {
        Swal.fire({
            title: "Remove from Catalog?",
            text: `Are you sure you want to delete ${item.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1a1a1a",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:3000/products/${item.id}`)
                    .then(() => {
                        setProducts(products.filter((w) => w.id !== item.id));
                        Swal.fire("Deleted", "Product has been removed.", "success");
                    });
            }
        });
    };

    return (
        <div className="admin-products-wrapper">
            <header className="products-header">
                <div className="header-text">
                    <h1>Inventory</h1>
                    <p>{products.length} Masterpieces in Catalog</p>
                </div>
                <button className="add-product-btn" onClick={() => navigate("/addproducts")}>
                    <Plus size={18} /> Add New Product
                </button>
            </header>

            <div className="products-grid">
                {products.length > 0 ? (
                    products.map((item, index) => (
                        <div key={index} className="product-admin-card">
                            <div className="image-wrapper">
                                <img src={item.image} alt={item.name} />
                                <div className="card-overlay">
                                    <button className="edit-icon-btn" onClick={() => navigate(`/editproducts/${item.id}`)}>
                                        <Edit3 size={18} />
                                    </button>
                                    <button className="delete-icon-btn" onClick={() => handleDelete(item)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="product-info">
                                <span className="brand-label">{item.brand}</span>
                                <h3 className="product-title">{item.name}</h3>
                                <p className="product-price">₹{Number(item.price).toLocaleString()}</p>
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