import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    loginAs: "student"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  function redirectByRole(role) {
    if (role === "student") {
      navigate("/student-dashboard");
    } else if (role === "warden") {
      navigate("/warden-dashboard");
    } else if (role === "guard") {
      navigate("/guard-dashboard");
    } else if (role === "admin" || role === "superadmin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/login");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Send only email and password to backend
      const data = await loginUser({
        email: formData.email,
        password: formData.password
      });

      // Check selected login type against actual database role
      if (
        formData.loginAs === "admin" &&
        !["admin", "superadmin"].includes(data.user.role)
      ) {
        throw new Error("This account is not an admin account.");
      }

      if (
        formData.loginAs !== "admin" &&
        data.user.role !== formData.loginAs
      ) {
        throw new Error(
          `This account is not registered as ${formData.loginAs}.`
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      redirectByRole(data.user.role);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Smart Hostel Gate Pass</h1>
        <p>Login to continue</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>Login As</label>

          <select
            name="loginAs"
            value={formData.loginAs}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="guard">Guard</option>
            <option value="warden">Warden</option>
            <option value="admin">Admin</option>
          </select>

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          New student? <Link to="/signup">Create account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;