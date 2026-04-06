import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IndianRupee, PackageCheck } from "lucide-react";
import "./payment.css";
import axiosInstance from "../../api/axiosInstance";
import { AppContext } from "../../AppProvider/APPContext";
import { toast } from "react-toastify";

export default function Payment() {
  const navigate = useNavigate();
  const { fetchCounts } = useContext(AppContext);

  const [buyItems, setBuyItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    pincode: "",
    phone: "",
    payment_method: "cod",
  });

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      Swal.fire({
        title: "Access Denied",
        text: "Please login first.",
        icon: "warning",
        confirmButtonColor: "#111111",
      }).then(() => navigate("/login"));
      return;
    }

    const purchaseType = localStorage.getItem("purchase-type");

    if (purchaseType === "single") {
      const item = JSON.parse(localStorage.getItem("purchase-item"));

      if (item) {
        const qty = item.quantity || 1;
        const price = item.price || item.price || 0;

        setBuyItems([item]);
        setTotalAmount(price * qty);
        setTotalItem(qty);
      }
    } else if (purchaseType === "bulk") {
      const items = JSON.parse(localStorage.getItem("purchase-items")) || [];

      const total = items.reduce((sum, item) => {
        const price = item.price || item.price || 0;
        const qty = item.quantity || 1;
        return sum + price * qty;
      }, 0);

      const totalQty = items.reduce((sum, item) => {
        return sum + (item.quantity || 1);
      }, 0);

      setBuyItems(items);
      setTotalAmount(total);
      setTotalItem(totalQty);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearPurchaseStorage = () => {
    localStorage.removeItem("purchase-type");
    localStorage.removeItem("purchase-item");
    localStorage.removeItem("purchase-items");
    localStorage.removeItem("total-amount");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCODOrder = async (selected_product_ids) => {
    const res = await axiosInstance.post("payments/order/place-order/", {
      selected_product_ids,
      name: formData.name,
      address: formData.address,
      pincode: formData.pincode,
      phone: formData.phone,
      payment_method: "cod",
    });

    await fetchCounts();

    Swal.fire({
      title: "Success",
      text: res.data.message || `Order ID: ${res.data.order_id}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      clearPurchaseStorage();
      navigate("/orders");
    });
  };
const handlewallet=async(selected_product_ids)=>{
const res = await axiosInstance.post("payments/order/place-order/",{
  selected_product_ids,
  name:formData.name,
  address:formData.address,
  pincode:formData.pincode,
  phone:formData.phone,
  payment_method:"wallet"
})
await fetchCounts();
Swal.fire({
    title: "Success",
    text: res.data.message || `Order ID: ${res.data.order_id}`,
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    clearPurchaseStorage();
    navigate("/orders");
  });
}
  const handleOnlinePayment = async (selected_product_ids) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      Swal.fire({
        icon: "error",
        title: "Razorpay failed to load",
        text: "Please check your internet connection.",
      });
      return;
    }

    const orderRes = await axiosInstance.post("payments/order/place-order/", {
      selected_product_ids,
      name: formData.name,
      address: formData.address,
      pincode: formData.pincode,
      phone: formData.phone,
      payment_method: "onlinepayment",
    });

    const razorpayOrder = orderRes.data;

    const options = {
      key: razorpayOrder.razorpay_key,
      amount: razorpayOrder.razorpay_amount,
      currency: razorpayOrder.razorpay_currency,
      name: "WatchStore",
      description: "Order Payment",
      order_id: razorpayOrder.razorpay_order_id,
      handler: async function (response) {
        try {
          const verifyRes = await axiosInstance.post("payments/razorpay/verify-payment/", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_id: razorpayOrder.order_id,
          });

          await fetchCounts();

          Swal.fire({
            title: "Payment successful!",
            text: verifyRes.data.message || "Order placed successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            clearPurchaseStorage();
            navigate("/orders");
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Payment verification failed",
            text: error.response?.data?.message || "Something went wrong",
          });
        }
      },
      prefill: {
        name: formData.name,
        contact: formData.phone,
      },
      notes: {
        address: formData.address,
        pincode: formData.pincode,
      },
      theme: {
        color: "#111111",
      },
      modal: {
        ondismiss: function () {
          Swal.fire({
            icon: "info",
            title: "Payment cancelled",
            text: "You closed the payment window.",
          });
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (formData.phone.length !=10){
      toast.error("phone number is not valid ",{
        autoClose:1000
      })
    return;
    }
    if (formData.pincode.length !=6){
      toast.error("pincode is not valid ",{
        autoClose:1000
      })
    return;
    }
    if (buyItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No items selected",
        text: "Please select items from cart first",
      });
      return;
    }

    try {
      setLoading(true);

      const selected_product_ids = buyItems.map(
        (item) => item.product_id || item.id
      );

      if (formData.payment_method === "cod") {
        await handleCODOrder(selected_product_ids);
      } else if (formData.payment_method === "onlinepayment") {
        await handleOnlinePayment(selected_product_ids);
      }else if(formData.payment_method==="wallet"){
        await handlewallet(selected_product_ids);
      }
    } catch (err) {
      console.log("Order error:", err.response?.data || err.message);

      Swal.fire({
        title: "Order failed",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-lg border-0 p-4">
            <h3 className="fw-bold mb-4">Selected Products</h3>

            <div className="product-scroll">
              {buyItems.length === 0 ? (
                <p>No products selected</p>
              ) : (
                buyItems.map((item, index) => {
                  const price = item.price || item.price || 0;
                  const qty = item.quantity || 1;
                  const image = item.image || item.image;
                  const name = item.name || item.name;
                  const brand = item.brand || item.brand;

                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom"
                    >
                      <img
                        src={image}
                        alt={name}
                        className="img-fluid rounded"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />

                      <div className="flex-grow-1">
                        <h5 className="mb-1">{name}</h5>
                        <p className="text-muted mb-1">{brand}</p>
                        <p className="mb-1">Price: ₹{price.toLocaleString()}</p>
                        <p className="mb-1">Quantity: {qty}</p>
                        <p className="fw-bold mb-0">
                          Total: <IndianRupee />{(price * qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3">
              <h4 className="fw-bold">Grand Total: <IndianRupee />{totalAmount.toLocaleString()}</h4>
              <p className="mb-0 text-muted">Total Items: {totalItem}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-lg border-0 p-4">
            <h3 className="fw-bold mb-4">Shipping & Payment</h3>

            <form onSubmit={placeOrder}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-control"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Payment Method</label>
                <select
                  name="payment_method"
                  className="form-select"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="cod">Cash On Delivery</option>
                  <option value="onlinepayment">Online Payment</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-dark btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                style={{ borderRadius: "8px", fontSize: "1.1rem" }}
              >
                {loading ? "Processing..." : "Confirm & Place Order"}
                <PackageCheck size={22} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
