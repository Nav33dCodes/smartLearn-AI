import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  // ✅ FIX: include token + navigate in deps
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleReset = async () => {
    if (!password) return setMsg("Enter password");

    setLoading(true);

    try {
      await axios.post(`${API}/reset-password`, {
        token,
        new_password: password
      });

      setMsg("✅ Password updated — redirecting...");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.detail || "❌ Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password 🔐</h2>

        <input
          style={styles.input}
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleReset} disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

        <p>{msg}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#111"
  },
  card: {
    background: "#1e1e1e",
    padding: 30,
    borderRadius: 12,
    width: 300,
    textAlign: "center",
    color: "#fff"
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#2a2a2a",
    color: "#fff"
  },
  button: {
    width: "100%",
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
    border: "none",
    background: "#10a37f",
    color: "#fff",
    cursor: "pointer"
  }
};