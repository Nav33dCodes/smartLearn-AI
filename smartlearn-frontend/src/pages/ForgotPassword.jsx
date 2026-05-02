import { useState } from "react";
import axios from "axios";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return alert("Enter email");

    setLoading(true);
    try {
      await axios.post(`${API}/forgot-password`, { email });
      setMsg("📩 Check your email for reset link");
    } catch {
      setMsg("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password 🔐</h2>

        <input
          style={styles.input}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p>{msg}</p>
      </div>
    </div>
  );
}

const styles = {
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#111" },
  card: { background: "#1e1e1e", padding: 30, borderRadius: 12, width: 300, textAlign: "center", color: "#fff" },
  input: { width: "100%", padding: 10, marginTop: 10, borderRadius: 8, border: "1px solid #333", background: "#2a2a2a", color: "#fff" },
  button: { width: "100%", padding: 10, marginTop: 15, borderRadius: 8, border: "none", background: "#10a37f", color: "#fff" }
};