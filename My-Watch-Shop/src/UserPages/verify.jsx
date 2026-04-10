import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const triggerVerification = async () => {
      try {
        // Send the uid and token to the backend
        const res = await axiosInstance.post(`accounts/verify-email/${uid}/${token}/`);
        
        Swal.fire({
          title: "Verified!",
          text: res.data.message,
          icon: "success",
          confirmButtonColor: "#27ae60"
        }).then(() => {
          navigate("/login"); // Redirect to login after success
        });

      } catch (err) {
        Swal.fire({
          title: "Verification Failed",
          text: err.response?.data?.error || "The link is invalid or has expired.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      } finally {
        setLoading(false);
      }
    };

    if (uid && token) {
      triggerVerification();
    }
  }, [uid, token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial" }}>
      {loading ? (
        <div className="animate__animated animate__fadeIn">
          <h2 style={{ fontWeight: "800" }}>VERIFYING YOUR ACCOUNT...</h2>
          <p>Please wait while we confirm your credentials.</p>
        </div>
      ) : (
        <p>Processing complete. You can close this tab if you aren't redirected.</p>
      )}
    </div>
  );
}