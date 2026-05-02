import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // 🔐 redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, []);

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API}/signup`, {
        email: email.toLowerCase().trim(), // 🔥 FIXED
        password
      });

      setSuccess("Account created successfully 🎉");

      // redirect after short delay
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
    if (Array.isArray(err.response?.data?.detail)) {
  const messages = err.response.data.detail.map(e => e.msg).join(", ");
  setError(messages);
} else {
  setError(err.response?.data?.detail || "Signup failed");
}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 10 }}>Create Account 🚀</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
        />

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <p style={styles.footer}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

// 🎨 STYLES
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
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: 18,
    borderRadius: 8,
    border: "none",
    background: "#10a37f",
    color: "#fff",
    fontWeight: "600"
  },
  link: {
    color: "#10a37f",
    cursor: "pointer"
  },
  footer: {
    marginTop: 14,
    fontSize: 13,
    color: "#bbb"
  },
  error: {
    background: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    padding: "8px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 10
  },
  success: {
    background: "rgba(16,163,127,0.1)",
    color: "#10a37f",
    padding: "8px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 10
  }
};