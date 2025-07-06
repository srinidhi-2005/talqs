import { useNavigate } from "react-router-dom";
import { ImHome } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleHomeClick = () => {
    navigate('/home');
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Invalid server response. Please try again.");
      }
      if (!res.ok) throw new Error(data.message || "Login failed");
      login(data.token, data.user);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div
        onClick={handleHomeClick}
        className="absolute top-16 left-16 bg-[#800000] text-white p-2 rounded-full cursor-pointer hover:bg-[#990909] transition"
      >
        <ImHome size={22} />
      </div>
      <form className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold mb-6 text-[#800000] text-center">Login</h2>
        <div className="mb-4">
          <label className="block text-lg font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6 relative">
          <label className="block text-lg font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white pr-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div
            className="absolute top-10 right-3 cursor-pointer text-gray-600 hover:text-[#800000]"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-[#800000] hover:bg-[#990909] text-white font-semibold py-3 rounded-lg transition text-lg mb-3"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <button onClick={handleSignupClick} type="button" className="text-[#800000] hover:underline font-medium">
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;