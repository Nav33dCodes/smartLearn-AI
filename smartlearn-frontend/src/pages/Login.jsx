import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🔐 Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/login`, {
        email: email.toLowerCase().trim(), // 🔥 important
        password
      });

      // ✅ Save token
      localStorage.setItem("token", res.data.access_token);

      // ✅ Redirect to main app
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 10 }}>Welcome Back 👋</h2>

        {error && <div style={styles.error}>{error}</div>}

   <input
  style={styles.input}
  placeholder="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
/>

<input
  style={styles.input}
  type="password"
  placeholder="Password"
  value={password}
  onChange={e => setPassword(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
/>

<div style={{ textAlign: "right", marginTop: 6 }}>
  <span
    style={{
      fontSize: 12,
      color: "#10a37f",
      cursor: "pointer"
    }}
    onClick={() => navigate("/forgot-password")}
  >
    Forgot Password?
  </span>
</div>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.footer}>
          Don’t have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/signup")}
          >
            Signup
          </span>
        </p>
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
    background: "linear-gradient(135deg, #111, #1a1a1a)"
  },
  card: {
    background: "#1e1e1e",
    padding: "32px 28px",
    borderRadius: 14,
    width: 340,
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: 12,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#2a2a2a",
    color: "#fff",
    outline: "none",
    fontSize: 14
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: 18,
    borderRadius: 8,
    border: "none",
    background: "#10a37f",
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    transition: "0.2s"
  },
  link: {
    color: "#10a37f",
    cursor: "pointer",
    fontWeight: 500
  },
  footer: {
    marginTop: 14,
    fontSize: 13,
    color: "#bbb"
  },
  error: {
    background: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 10
  }
};