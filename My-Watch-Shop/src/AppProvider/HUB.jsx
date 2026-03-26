import axios from "axios"
import { useEffect, useState } from "react"
import { AppContext } from "./APPContext"

export default function HUB({ children }) {
  const [Data, SetData] = useState([]);
  const [addcart, setAddCart] = useState([]);
  const [wishlist, setWishList] = useState([]);

  // SAFE PARSE
  const loginid = JSON.parse(localStorage.getItem("loggeduser") || "null");

  useEffect(() => {
    let interval;

    const fetching = async () => {
      if (loginid) {
        const res = await axios.get(`http://localhost:3000/users/${loginid.id}`);
        setAddCart(res.data.cart || []);
        setWishList(res.data.wishlist || []);
      }
    };

    fetching();
    interval = setInterval(fetching, 1000);

    return () => clearInterval(interval);
  }, [loginid]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await axios.get("http://localhost:3000/products");
        SetData(res.data || []);
      } catch (err) {
        console.log("unable to fetch", err);
      }
    };

    fetchdata();
  }, []);

  return (
    <AppContext.Provider value={{ addcart, wishlist }}>
      {children}
    </AppContext.Provider>
  );
}
