import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./orderdetail.css";
import axiosInstance from "../api/axiosInstance";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  // --- EXISTING FUNCTIONS ---
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("accounts/userlist/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user) => {
    const newStatus = !user.is_active;
    const actionText = newStatus ? "Activate" : "Block";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to ${actionText} ${user.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus ? "#27ae60" : "#d33",
      confirmButtonText: `Yes, ${actionText}!`,
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.patch(`accounts/users/block/${user.email}/`, {
        is_active: newStatus,
      });

      Swal.fire(
        "Success",
        `User has been ${newStatus ? "activated" : "blocked"}.`,
        "success"
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: newStatus } : u
        )
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  // --- NEW DELETE FUNCTION ---
  const deleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `Are you sure you want to delete ${user.name}? This cannot be undone.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete User",
    });

    if (!result.isConfirmed) return;

    try {
      // API call to delete - using ID as is standard for delete operations
      await axiosInstance.delete(`accounts/users/delete/${user.id}/`);

      Swal.fire("Deleted", "User has been removed from the registry.", "success");

      // Remove from UI state
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("Delete Error:", err);
      Swal.fire("Error", "Could not delete user", "error");
    }
  };

  return (
    <div className="order-details-wrapper">
      <header className="page-header">
        <h1 style={{ fontWeight: "800" }}>User Registry</h1>
        <p>Manage client access and account status</p>
      </header>

      <div className="table-scroll-container">
        <table className="luxury-order-table">
          <thead>
            <tr>
              <th style={{ fontWeight: "800" }}>Client Identity</th>
              <th style={{ fontWeight: "800" }}>Email</th>
              <th style={{ fontWeight: "800" }}>Account Status</th>
              <th style={{ textAlign: "center", fontWeight: "800" }}>Administrative Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="order-row animate__animated animate__fadeIn">
                <td className="client-cell">
                  <span className="client-name" style={{ fontWeight: "700" }}>{user.name}</span>
                  <span className="client-email">ID: #USR-{user.id}</span>
                </td>

                <td className="date-cell">{user.email}</td>

                <td className="status-cell">
                  <span
                    className={`status-badge ${
                      user.is_active ? "shipped" : "canceled"
                    }`}
                    style={{ fontWeight: "800" }}
                  >
                    {user.is_active ? "Active" : "Blocked"}
                  </span>
                </td>

                <td style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    {/* Block/Unblock Button */}
                    <button
                      onClick={() => toggleUserStatus(user)}
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        backgroundColor: user.is_active ? "#fff" : "#1a1a1a",
                        color: user.is_active ? "#d33" : "#fff",
                        border: user.is_active ? "1px solid #d33" : "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        transition: "0.3s",
                      }}
                    >
                      {user.is_active ? "Block User" : "Unblock User"}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteUser(user)}
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        backgroundColor: "#d33",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        transition: "0.3s",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}