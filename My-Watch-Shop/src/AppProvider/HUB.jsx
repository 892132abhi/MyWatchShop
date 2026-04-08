import { useEffect, useState } from "react";
import { AppContext } from "./APPContext";
import axiosInstance from "../api/axiosInstance";

export default function HUB({ children }) {
  const [addcart, setAddCart] = useState(0);
  const [wishlist, setWishList] = useState(0);
  const [wallets,setWallets] = useState("0.00");

  const fetchCounts = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
       const walletbalance = await axiosInstance.get("wallet/balance/");
      const cartcount = await axiosInstance.get("products/cart/count/");
      const wishcount = await axiosInstance.get("products/wishlist/count/");
      await axiosInstance.get("payments/order/items/");
      setAddCart(cartcount.data.cart_count || 0);
      setWishList(wishcount.data.wish_count || 0);
      setWallets(walletbalance.data.balance || "0.00")
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);
``
  return (
    <AppContext.Provider value={{ wallets,addcart, wishlist, fetchCounts }}>
      {children}
    </AppContext.Provider>
  );
}
