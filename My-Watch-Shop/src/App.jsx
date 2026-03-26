import { Route, Routes } from 'react-router-dom'
import './App.css'
import UserLogin from './UserPages/LoginPage/UserLogin'
import UserRegister from './UserPages/RegisterPage/UserRegister'
import Home from './UserPages/HomePgae/Home'
import ProductsDetails from './UserPages/Products/ProductsDetails'
import Products from './UserPages/Products/Products'
import Cart from './UserPages/ProductCart/Cart'
import Payment from './UserPages/Payment/Payment'
import Navbar from './UserPages/Navbar/Navbar'
import Wishlist from './UserPages/Wishlist/Wishlist'
import {ToastContainer} from 'react-toastify'
import AdminLogin from './AdminLogin/AdminLogin'
import Dashboard from './Dashboard/Dashboard'
import AdminNavbar from './AdminNavbar/AdminNavbar'
import UserDetails from './UserDetails/UserDetails'
import AdminProducts from './AdminProducts/AdminProducts'
import EditProducts from './Editproducts/EditProducts'
import AddProducts from './Addproducts/AddProducts'
import ProtectedRouting from './AppProvider/ProtectedRouting'
import OrderDetails from './Orderdetails/OrderDetails'
import Userorder from './UserPages/Orders/Userorder'
function App() {

  return (
    <>
   <ToastContainer position='top-right' autoClose={2000}/>
    <Routes>
    <Route element={<Navbar/>}>
    <Route path='/' element={<Home />}/>
    <Route path='/products' element={<Products />}/>
    <Route path='/products/:id' element={<ProductsDetails />}/>
    <Route path='/cart' element={<Cart />}/>
    <Route path='/wishlist' element={<Wishlist />}/>
    <Route path='/payment'element={<Payment />}/>
    <Route path='/orders'element={<Userorder/>}/>
    </Route>
<Route path='/login' element={<UserLogin />}/>
<Route path='/register' element={<UserRegister />}/>


<Route path='/adminlogin' element={<AdminLogin />}/>
<Route element={<AdminNavbar />}>
<Route element={<ProtectedRouting/>}>
<Route path='/dashboard' element={<Dashboard />}/>
<Route path='/userdetails' element={<UserDetails />}/>
<Route path='/adminproducts' element={<AdminProducts />}/>
<Route path='/editproducts/:id'element={<EditProducts />}/>
<Route path='/addproducts' element={<AddProducts />}/>
<Route path='/orderdetails' element={<OrderDetails />}/>
</Route>
</Route>
<Route path='/*' element={<UserLogin />}/>
</Routes>

    
     {/* <UserRegister /> */}
    </>
  )
}

export default App
