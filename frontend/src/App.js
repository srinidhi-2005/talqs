import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Welcome from "./pages/Welcome"
import Features from "./pages/Features"
import Contact from "./pages/Contact"
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Password from "./pages/Password";
import Navbar from "./components/Navbar";
import { useAuth } from "./AuthContext";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8">Loading...</div>;

  // Only show Navbar on /home
  const showNavbar = location.pathname === "/home";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <>
            <Welcome />
            <Features />
            <Contact />
          </>
        } />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/password" element={<Password />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;