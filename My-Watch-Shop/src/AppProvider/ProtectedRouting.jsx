import {Navigate, Outlet} from 'react-router-dom'
export default function ProtectedRouting(){
    const Admin = JSON.parse(localStorage.getItem("admin"))
    if(!Admin){
        return <Navigate to='/adminlogin' replace />
    }
    return(<>
    
    <Outlet/>
    </>)
}