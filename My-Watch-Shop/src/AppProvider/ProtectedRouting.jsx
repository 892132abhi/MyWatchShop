import {Navigate, Outlet} from 'react-router-dom'
export default function ProtectedRouting(){
    const Admin = JSON.parse(localStorage.getItem("Admin"))
    if(!Admin){
        return <Navigate to='/adminlogin' replace />
    }
    return(<>
    
    <Outlet/>
    </>)
}