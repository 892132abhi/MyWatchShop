import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import { Trash,Undo2, ShoppingBag } from "lucide-react"
import './cart.css'
export default function Cart(){
    
    const [cartItems,SetCartItems]= useState([])
    const [amount,setAmount]= useState()
    
    const navigate=useNavigate()
    useEffect(()=>{
      const log = JSON.parse(localStorage.getItem("loggeduser"))
      if(!log) return
      let interval;
      const status=async()=>{
        const data = await axios.get(`http://localhost:3000/users/${log.id}`)
        const result = data.data
        if(!result.active){
          Swal.fire({
            title:"admin blocked you...!!!",
            icon:"error",
            showConfirmButton:false
          }).then(()=>{
            localStorage.removeItem("loggeduser")
            navigate("/")
          })
        } 
      }
      status()
          interval = setInterval(status,1500)
          return()=>clearInterval(interval)
    },[])
    useEffect(()=>{
        try{
        const logged = JSON.parse(localStorage.getItem("loggeduser"))
        if(!logged){
            alert("please login to see the cart ...")
            navigate("/login")
            return;
        }
       
        const fetchcart=async()=>{
            try{
              const data =  await axios.get(`http://localhost:3000/users/${logged.id}`)
                const  res =data.data 
                
                SetCartItems((res.cart||[]).map((item)=>({...item,quantity : item.quantity || 1})))
                
            }
            catch(err){
                alert("unable to load cart items",err)
            }
        }
        fetchcart()
        }
        catch(err){
            console.log("error Found",err)
        }
    },[navigate])
    useEffect(()=>{
        const total = cartItems.reduce((sum,item)=>{
           return sum +item.price * item.quantity;
        },0)
        setAmount(total)
    },[cartItems])
    const back=()=>{
        navigate('/products')
    }
    const UpdateQuantity = async (index, newQty) => {
  try {
    const qty = !newQty ||newQty < 1 ? 1 : newQty;

    const updated = cartItems.map((item, i) =>
      i === index ? { ...item, quantity: qty } : item
    );
    SetCartItems(updated);

    const loggeduser = JSON.parse(localStorage.getItem("loggeduser"));

    await axios.patch(`http://localhost:3000/users/${loggeduser.id}`, {
      cart: updated,
    });

    loggeduser.cart = updated;
    localStorage.setItem("loggeduser", JSON.stringify(loggeduser));

  } catch (err) {
    console.log("Quantity update failed", err);
  }
};

    const Remove=async(index)=>{
        try{
       const loggeduser =JSON.parse(localStorage.getItem("loggeduser"))
        const res = cartItems.filter((_,i)=> i!==index)
        SetCartItems(res)
        await axios.patch(`http://localhost:3000/users/${loggeduser.id}`,{cart :res})
        Swal.fire({
          title:  `item deleted from cart!`,
          icon: "success",
          iconColor:"blue",
          color:"red",
          draggable:true,
          showConfirmButton:false
        
              })
            
              .then(()=>{
                if(res.length===0){
                Swal.fire({
                    title:"Cart become empty..!",
                    icon:"warning",
                    showConfirmButton:false,
                    draggable:true
                })
                
                navigate("/products")
                
                
              }
              })
              
    }catch(err){
        console.log("error found",err)
    }
}
    const payment=(items)=>{
        localStorage.setItem("purchase-item", JSON.stringify(items));
        navigate("/payment")
    }
    return (
  <>
    {/* --- TOP NAVIGATION & SUMMARY --- */}
    <header className="cart-header">
      <button onClick={back} className="back-btn-luxury">
        <Undo2 size={18} /> SEE PRODUCTS
      </button>
      
      <div className="total-summary">
        <h3>TOTAL INVESTMENT: <span>₹{amount?.toLocaleString()}</span></h3>
      </div>
      {cartItems.length <1 ? (
  <button className="btn-purchase" onClick={() => navigate("/products")}>
            START SHOPPING
          </button> // Replace with your logic
) : (
  <button className="btn-purchase" onClick={() => navigate("/payment")}>
    CHECKOUT ALL
  </button>
)}
      
    </header>

    {/* --- CART CONTENT --- */}
    <main className="cart-container">
      {cartItems.length === 0 ? (
        <div className="empty-cart animate__animated animate__fadeIn">
          <Trash size={80} strokeWidth={1} />
          <h2>The collection is empty.</h2>
          
        </div>
      ) : (
        cartItems.map((items, index) => (
          <div key={index} className="cart-item-row animate__animated animate__fadeInUp">
            
            {/* 1. Checkbox & Image */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <input type="checkbox" className="luxury-checkbox" />
              <div className="cart-img-wrapper">
                <img src={items.image} alt={items.name} />
              </div>
            </div>

            {/* 2. Details */}
            <div className="cart-info">
              <h2>{items.name}</h2>
              <p style={{ color: '#888', fontSize: '13px' }}>{items.brand}</p>
              <p className="pricep">₹{(items.price * items.quantity).toLocaleString()}</p>
            </div>

            {/* 3. Quantity Controls */}
            <div className="counting">
              <p style={{ fontSize: '10px', letterSpacing: '1px', marginBottom: '5px' }}>QUANTITY</p>
              <div className="luxury-qty">
                <button onClick={() => UpdateQuantity(index, items.quantity - 1)}>-</button>
                <input type="number" value={items.quantity} readOnly />
                <button onClick={() => UpdateQuantity(index, items.quantity + 1)}>+</button>
              </div>
            </div>

            {/* 4. Actions */}
            <div className="cart-actions">
              <button className="btn-purchase" onClick={() => payment(items)}>
                PURCHASE <ShoppingBag size={14} />
              </button>
              <button className="btn-remove" onClick={() => Remove(index)}>
                REMOVE <Trash size={14} />
              </button>
            </div>

          </div>
        ))
      )}
    </main>
  </>
);
}