import axios from "axios";
import "./Products.css";
import { useNavigate } from "react-router-dom";
import {  useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Funnel, Undo2, Heart, Scale, View } from "lucide-react";
import "animate.css"
import { toast } from "react-toastify";
export default function Products() {
  const navigate = useNavigate();
  const [watches, setWatches] = useState([]);
  const [allWatches, setAllWatches] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [wishlists, setWishlists] = useState([])
  const [search,setSearch] = useState("")
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  useEffect(()=>{
    let interval;
   const fetch=async()=>{

const user = JSON.parse(localStorage.getItem("loggeduser"))
const Data = await axios.get(`http://localhost:3000/users/${user.id}`)
const res= Data.data

if(!res.active){
  Swal.fire({
    title:"Admin blocked you",
    icon:"error",
    showConfirmButton:false
  })
  .then(()=>{
    localStorage.removeItem("loggeduser")
    navigate("/")
    window.location.reload()
  })
}
    }
    fetch()
  
  interval = setInterval(fetch,1500);
  return()=>clearInterval(interval)
  },[])

  useEffect(()=>{
    const getData=async()=>{
    const user = JSON.parse(localStorage.getItem("loggeduser"))
    if(user){
        const Data = await axios.get(`http://localhost:3000/users/${user.id}`)
        const res = Data.data.wishlist
        setWishlists(res)
    }
}
getData()
},[])
  useEffect(() => {
    try{
    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        setWatches(res.data);
        setAllWatches(res.data);
      })
      .catch((err) => console.log("Error found:", err));
  }catch(err){
console.log("error found",err)
  }
}, []);

  const ADDcart = async (item) => {

    
    try{
const loggeduser = JSON.parse(localStorage.getItem("loggeduser"));

    if (!loggeduser) {
      Swal.fire({
        title: " please login...",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      })

      return;
    }
    if(!loggeduser.active){
      Swal.fire({
        title:"Admin blocked You!!!",
        icon:"error",
        draggable:false,
        showConfirmButton:true
      })
      return
    }
    else{
    try {

      const res = await axios.get(`http://localhost:3000/users/${loggeduser.id}`);
      const currentuser = res.data;
      if(!currentuser.active){
        Swal.fire({
        title:"Admin blocked You!!!",
        icon:"error",
        draggable:false,
        showConfirmButton:true
        })
        return
      }
      const alreadyincart = currentuser.cart.some((cartitem) => cartitem.id === item.id)
      if (alreadyincart) {
        const updateqantity = currentuser.cart.map((cartitem)=>cartitem.id ===item.id? {...cartitem,quantity:cartitem.quantity+1}:cartitem )
        await axios .patch(`http://localhost:3000/users/${loggeduser.id}`,{
          cart:updateqantity
        })
        loggeduser.cart = updateqantity
        localStorage.setItem("loggeduser",JSON.stringify(loggeduser))
        toast.success("Quantity Increased...",{
          autoClose:1100
        })
       
      }
      else {
        const updateCart = [...currentuser.cart, item];
        await axios.patch(`http://localhost:3000/users/${loggeduser.id}`, {
          cart: updateCart,
        });
        Swal.fire({
          title: `${item.name} added to cart!`,
          icon: "success",
          draggable: true,
          showConfirmButton: true,
        })




      }

    } catch (err) {
      console.log("Error found", err);
    }
  }
  
  }catch(err){
    console.log("error found",err)
  }

  };

  const types = [...new Set(allWatches.map((item) => item.type))];
  const brands = [...new Set(allWatches.map((item) => item.brand))];

  useEffect(() => {
    try{
    let filtered = allWatches;
    if (selectedType) {
      filtered = filtered.filter((item) => item.type === selectedType);
    }
    if (selectedBrand) {
      filtered = filtered.filter((item) => item.brand === selectedBrand);
    }
    if(search.trim()!==""){
      filtered = filtered.filter((item)=>item.name.toLowerCase().includes(search.toLowerCase()))
    }
    setWatches(filtered);
  }catch(err){
    console.log(err)
  }
}, [selectedType, selectedBrand, allWatches,search]);
  const Addwishlist = async (item) => {
    try{
    const user = JSON.parse(localStorage.getItem("loggeduser"))
    if (!user) {
      Swal.fire({
        title: "Please Login...!",
        icon: "warning",
        draggable: true,
        showConfirmButton: false
      })
      return
      
    } else {
      
      const Data = await axios.get(`http://localhost:3000/users/${user.id}`)
      const res = Data.data.wishlist || []
      if(!Data.data.active){ 
        Swal.fire({
        title:"Admin blocked You!!!",
        icon:"error",
        draggable:false,
        showConfirmButton:true
        })
      }
      else{
      setWishlists(res)
      const exists = res.find((w) => w.id === item.id)
      let Datas
      
      if (exists) {
         Datas = res.filter((i)=> i.id !==item.id)
        setWishlists(Datas)
         await axios.patch(`http://localhost:3000/users/${user.id}`,{
          wishlist :Datas
        })
        return
      }
      else {
         Datas = [...res, item]
         setWishlists(Datas)
        await axios.patch(`http://localhost:3000/users/${user.id}`, {
          wishlist: Datas,
          
        })
      }
     
      
        return
    }
    }
  }catch(err){
    console.log("error found",err)
  }
  }

  return (
    <>
      <div className="navbar">
  <div className="search-container">
    <input type="text" value={search} placeholder="Search our collection..." onChange={(e)=>setSearch(e.target.value)}/>
  </div>

  {/* --- CUSTOM BRAND DROPDOWN --- */}
  <div className="luxury-dropdown-wrapper" onMouseLeave={() => setIsBrandOpen(false)}>
    <div className="luxury-dropdown-trigger" onClick={() => setIsBrandOpen(!isBrandOpen)}>
      <span>{selectedBrand || "All Brands"}</span>
      <Funnel size={14} className={isBrandOpen ? "rotate-icon" : ""} />
    </div>
    <div className={`luxury-dropdown-content ${isBrandOpen ? "show" : ""}`}>
      <div className="luxury-option" onClick={() => {setSelectedBrand(""); setIsBrandOpen(false)}}>All Brands</div>
      {brands.map((brand, index) => (
        <div key={index} className="luxury-option" onClick={() => {setSelectedBrand(brand); setIsBrandOpen(false)}}>
          {brand}
        </div>
      ))}
    </div>
  </div>

  {/* --- CUSTOM TYPE DROPDOWN --- */}
  <div className="luxury-dropdown-wrapper" onMouseLeave={() => setIsTypeOpen(false)}>
    <div className="luxury-dropdown-trigger" onClick={() => setIsTypeOpen(!isTypeOpen)}>
      <span>{selectedType || "All Types"}</span>
      <Funnel size={14} className={isTypeOpen ? "rotate-icon" : ""} />
    </div>
    <div className={`luxury-dropdown-content ${isTypeOpen ? "show" : ""}`}>
      <div className="luxury-option" onClick={() => {setSelectedType(""); setIsTypeOpen(false)}}>All Types</div>
      {types.map((type, index) => (
        <div key={index} className="luxury-option" onClick={() => {setSelectedType(type); setIsTypeOpen(false)}}>
          {type}
        </div>
      ))}
    </div>
  </div>

  <button className="navbar-btn" onClick={() => { setSelectedBrand(""); setSelectedType(""); setSearch(""); }}>
    Clear Filters
  </button>
</div>

      <div className="productdiv animate__animated animate__bounceInLeft">
        {watches.map((item, index) => (
          
          <div key={index} className="product-card " 
            style={{ cursor: "pointer" }}><div style={{ textAlign: "end", transform: "Scale(1.05)", color: "blue"}}
            ><Heart color={wishlists.some((w)=>w.id===item.id)?"rgb(37, 163, 208)":"grey"}
            fill={wishlists.some((w)=>w.id===item.id)?"rgb(37, 163, 208)":"none"} onClick={(e) =>{e.stopPropagation(); Addwishlist(item)}}/></div>
            <div
           >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                width="150px"
                height="150px"
              onClick={()=>
            navigate(`/products/${item.id}`)
            
            } />
            )}
            <p>{item.name}</p>
            <p className ="pricep" style={{fontSize:"25px"}}>₹{(item.price).toLocaleString()}</p>
            
            

             <button
              onClick={(e) =>{e.stopPropagation(); ADDcart(item)}}
              style={{ borderRadius: "10px", marginTop: "5px" }}
            >
              Add to Cart
            </button>
              

            </div>
            
          </div>
        ))}
      </div>
      <footer style={{ textAlign: "center", marginBottom: "40px" }}>
        @copy right by lord AmS Ltd.
      </footer>
    </>
  );
}
