import "./Products.css";
import { useNavigate } from "react-router-dom";
import {  useState, useEffect,useContext } from "react";
import Swal from "sweetalert2";
import { Funnel, Undo2, Heart, Scale, View } from "lucide-react";
import "animate.css"
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { AppContext } from "../../AppProvider/APPContext";
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
  const { fetchCounts } =useContext(AppContext)
useEffect(()=>{
   const fetch=async()=>{

const token = localStorage.getItem('access')

if(!token){
  Swal.fire({
    title:"please login",
    icon:"error",
    showConfirmButton:false
  })
  .then(()=>{
    localStorage.removeItem("loggeduser")
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate("/")
    window.location.reload()
  })
}
    }
    fetch()
  
},[])

useEffect(()=>{
const getData=async()=>{
const token = localStorage.getItem('access')
if (!token) return ;
try{
const res = await axiosInstance.get("products/wishlist/");
setWishlists(res.data)
}catch(err){
  console.log("error found",err.response?.data||err.message)
}
}
getData()
},[])
  useEffect(() => {
    try{
    axiosInstance.get("products/")
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
  const token = localStorage.getItem('access')
    console.log("token",token)
  if (!token){
    Swal.fire({
      icon:"error",
      text:"please login ",
      showConfirmButton:false
    })
    return ;
  }
    try{
      const res = await axiosInstance.post("products/cart/add/",{
        product_id:item.id
      })
      const updatestock = res.data.stock;
      setWatches((prev) =>
  prev.map((watch) =>
    watch.id === item.id ? { ...watch, quantity: updatestock } : watch
  )
);
     setAllWatches((prev) =>
  prev.map((watch) =>
    watch.id === item.id ? { ...watch, quantity: updatestock } : watch
  )
);

      fetchCounts();
    if (res.data.message=="Product quantity increased"){
      toast.success("Product quantity increased ",{
        position:"top-left",
        autoClose:1000,
      }
    )
       
    }else{
      Swal.fire({
        icon:"success",
        text:res.data.message || "Product added to cart ",
        showConfirmButton:true
      })
    }
     
    }catch(err){
      console.log("error found :",err.response?.data||err.message);
      if (err.response?.status === 400) {
      Swal.fire("Wait!", err.response.data.message, "warning");
    }
      if(err.response?.status===401){
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        navigate('/login')
      }
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
    const token = localStorage.getItem("access")
    if (!token) {
      Swal.fire({
        title: "Please Login...!",
        icon: "warning",
        draggable: true,
        showConfirmButton: false
      })
      return
    }
    try{
       
      const res = await axiosInstance.post("products/wishlist/add/",{
        product_id:item.id
      })
      fetchCounts();
       Swal.fire({
      title: res.data.message,
      icon: "success",
      showConfirmButton: false,
      timer: 1200,
    });
    if(res.data.message=="Added to Wishlist"){
      setWishlists((prev)=>[...prev,{product_id:item.id}])
    }else if(res.data.message=='Removed From Wishlist'){
      setWishlists((prev)=>prev.filter((w)=>w.product_id!==item.id)
    );
    }
    }
  catch(err){
    console.log("error found",err.response?.data||err.message)
    if (err.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    }
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

      <div className="productdiv animate__animated animate__fadeIn">
        {watches.map((item, index) => (
          
          <div key={index} className="product-card animate__animated animate__fadeIn" 
            style={{ cursor: "pointer" }}><div style={{ textAlign: "end", transform: "Scale(1.05)", color: "blue"}}
            ><Heart color={wishlists.some((w) => (w.product_id || w.id) === item.id)?"#333333":"grey"}
            fill={wishlists.some((w) => (w.product_id || w.id) === item.id)?"#333333":"none"} onClick={(e) =>{e.stopPropagation(); Addwishlist(item)}}/></div>
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
            
            
              {item.quantity<1?(
                <>
                <button
                disabled
              onClick={(e) =>{e.stopPropagation()}}
              style={{ borderRadius: "10px", marginTop: "5px",color:"red"}}
            >
              Out Of Stock
            </button>
                </>
              ):(
                <>
              <button
              onClick={(e) =>{e.stopPropagation(); ADDcart(item)}}
              style={{ borderRadius: "10px", marginTop: "5px" }}
            >
              Add to Cart
            </button>
              </>
              )}
             
              
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
