import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownWidth, setDropdownWidth] = useState(undefined);

  useEffect(() => {
    if (dropdown && buttonRef.current) {
      setDropdownWidth(buttonRef.current.offsetWidth);
    }
  }, [dropdown]);

  const handleProfile = () => {
    setDropdown(false);
    navigate("/profile");
  };
  const handleLogout = () => {
    logout();
    setDropdown(false);
    navigate("/");
  };
  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav
      className="fixed top-6 left-[150px] right-[150px] z-30 bg-[#800000] flex items-center justify-between px-8 py-4 shadow-2xl rounded-2xl"
      style={{ margin: 0 }}
    >
      <div className="text-2xl font-bold cursor-pointer text-white select-none" onClick={() => navigate("/home")}>TextSummarizer</div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setDropdown((d) => !d)}
                className="bg-[#990909] px-5 py-2 rounded font-semibold text-white shadow flex items-center gap-2"
              >
                <span>{user.username}</span>
                <IoIosArrowDown className="w-4 h-4" />
              </button>
              {dropdown && (
                <div
                  className="absolute right-0 mt-7 bg-white text-black rounded shadow-lg z-10"
                  style={{ width: dropdownWidth }}
                >
                  <button onClick={handleProfile} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button onClick={handleLogin} className="bg-white text-[#800000] px-5 py-2 rounded font-semibold shadow">Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;