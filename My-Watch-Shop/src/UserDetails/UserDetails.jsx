import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import './orderdetail.css'; // Reusing your existing luxury CSS

export default function UserManagement() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:3000/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 3000);
        return () => clearInterval(interval);
    }, []);

    const toggleUserStatus = async (user) => {
        const newStatus = !user.active;
        const actionText = newStatus ? "Activate" : "Block";

        Swal.fire({
            title: `Are you sure?`,
            text: `You are about to ${actionText} ${user.name}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: newStatus ? "#27ae60" : "#d33",
            confirmButtonText: `Yes, ${actionText}!`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Update the status in the database
                    await axios.patch(`http://localhost:3000/users/${user.id}`, {
                        active: newStatus
                    });
                    
                    Swal.fire("Success", `User has been ${newStatus ? 'activated' : 'blocked'}.`, "success");
                    fetchUsers(); // Refresh data
                } catch (err) {
                    Swal.fire("Error", "Could not update status", "error");
                }
            }
        });
    };

    return (
        <div className="order-details-wrapper">
            <header className="page-header">
                <h1>User Registry</h1>
                <p>Manage client access and account status</p>
            </header>

            <div className="table-scroll-container">
                <table className="luxury-order-table">
                    <thead>
                        <tr>
                            <th>Client Identity</th>
                            <th>Email</th>
                            <th>Account Status</th>
                            
                            <th style={{ textAlign: "center" }}>Administrative Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="order-row">
                                <td className="client-cell">
                                    <span className="client-name">{user.name}</span>
                                    <span className="client-email">ID: #USR-{user.id}</span>
                                </td>
                                <td className="date-cell">
                                    {user.email}
                                </td>
                                <td className="status-cell">
                                    <span className={`status-badge ${user.active ? 'shipped' : 'canceled'}`}>
                                        {user.active ? "Active" : "Blocked"}
                                    </span>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <button 
                                        onClick={() => toggleUserStatus(user)}
                                        style={{
                                            padding: "8px 16px",
                                            cursor: "pointer",
                                            backgroundColor: user.active ? "#fff" : "#1a1a1a",
                                            color: user.active ? "#d33" : "#fff",
                                            border: user.active ? "1px solid #d33" : "none",
                                            borderRadius: "4px",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                            transition: "0.3s"
                                        }}
                                    >
                                        {user.active ? "Block User" : "Unblock User"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}