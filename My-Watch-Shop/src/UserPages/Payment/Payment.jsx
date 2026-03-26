import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import './payment.css';
import { PackageCheck } from "lucide-react";

export default function Payment() {
    const navigate = useNavigate();
    const [buyItem, setBuyItem] = useState([]);
    const users = JSON.parse(localStorage.getItem("loggeduser"));

    useEffect(() => {
        const item = JSON.parse(localStorage.getItem("purchase-item"));
        if (item) {
            setBuyItem([item]);
        }
    }, []);

    const placeOrder = async (item) => {
        const Data = await axios.get(`http://localhost:3000/users/${users.id}`);
        const user = Data.data;

        if (!user.active) {
            Swal.fire({
                title: "Admin blocked you",
                icon: "error",
                showConfirmButton: true
            });
            return;
        }

        const totalamount = item.price || 0;
        const neworder = {
            item,
            totalamount,
            date: new Date().toLocaleString()
        };

        toast.warning("Placing Order...!!!");

        setTimeout(() => {
            Swal.fire({
                title: `${item.name} Order Placed successfully!`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            }).then(async () => {
                const updatecart = (user.cart || []).filter((w) => w.id !== item.id);
                
                // Update User Data
                await axios.patch(`http://localhost:3000/users/${users.id}`, {
                    orders: [...(user.orders || []), neworder],
                    cart: updatecart
                });

                // Post to Global Orders
                await axios.post(`http://localhost:3000/order/`, {
                    status: users.active,
                    name: users.name,
                    email: users.email,
                    orders: [neworder]
                });

                setBuyItem([]);
                const updateuser = { ...users, orders: [...(user.orders || []), neworder], cart: updatecart };
                localStorage.setItem("loggeduser", JSON.stringify(updateuser));
                localStorage.removeItem("purchase-item");
                navigate("/orders");
            });
        }, 2000);
    };

    return (
        <>
        <div className="container py-5">
            <div className="row justify-content-center">
                {buyItem.map((item, index) => (
                    <div key={index} className="col-md-6">
                        <div className="card shadow-lg border-0 text-center p-4">
                            <h3 className="fw-bold mb-4">Review Your Order</h3>
                            
                            <div className="mb-4">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="img-fluid rounded" 
                                    style={{ maxHeight: "350px", objectFit: "contain" }} 
                                />
                            </div>

                            <div className="mb-4">
                                <h4 className="text-dark">{item.name}</h4>
                                {/* <p className="text-muted fs-5">Item Amount: <strong>${item.price}</strong></p> */}
                                 <p className="text-muted fs-5">Total Amount: <strong>₹{(item.price * item.quantity).toLocaleString()}</strong></p>
                            </div>

                            <button 
                                onClick={() => placeOrder(item)} 
                                className="btn btn-dark btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                                style={{ borderRadius: "8px", fontSize: "1.2rem" }}
                            >
                                Confirm & Place Order <PackageCheck size={24} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
   
   </> );
}