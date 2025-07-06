import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImHome } from "react-icons/im";
import { FaUserTie } from "react-icons/fa6";
import { MdOutlineAttachEmail } from "react-icons/md";

const Profile = () => {
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
        setProfile({ username: data.username, email: data.email });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setSuccess("Profile updated!");
      setEdit(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordClick = () => {
    navigate("/password");
  };

  const handleBack = () => {
    navigate("/home");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-[#DEDEDE]">
      <div
        onClick={handleBack}
        className="absolute top-16 left-16 bg-[#800000] text-white p-2 rounded-full cursor-pointer hover:bg-[#990909] transition"
      >
        <ImHome size={22} />
      </div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl min-h-[450px] p-1 overflow-hidden">
        {/* Header */}
        <div className="p-6">
          <h2 className="text-[#800000] text-3xl font-bold text-center">User Profile</h2>
        </div>
        <div className="h-[1px] bg-[#800000] w-full mt-[5px]"></div>
        {/* Profile Info */}
        <div className="p-7">
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <div className="mb-4 flex items-center space-x-3 mt-10">
            <FaUserTie size={40} className="text-[#800000]" />
            <div>
              <p className="text-2xl font-semibold text-black-400">Username</p>
              <input
                name="username"
                value={profile.username}
                onChange={handleChange}
                disabled={!edit}
                className="text-gray-900 text-lg"
              />
            </div>
          </div>

          <div className="mb-6 flex items-center space-x-3 mt-10">
            <MdOutlineAttachEmail size={40} className="text-[#800000]" />
            <div>
              <p className="text-2xl font-semibold text-black-400">Email</p>
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!edit}
                className="text-gray-900 text-lg"
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex gap-2">
            {edit ? (
              <>
                <button
                  onClick={handleSave}
                  className="w-full bg-[#800000] hover:bg-[#990909] text-white font-medium py-2 rounded transition mt-10"
                >
                  Save
                </button>
                <button
                  onClick={() => setEdit(false)}
                  className="w-full bg-gray-300 text-black font-medium py-2 rounded transition mt-10"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="w-full bg-[#800000] hover:bg-[#990909] text-white font-medium py-2 rounded transition mt-10"
              >
                Edit
              </button>
            )}
          </div>
          <button
            onClick={handlePasswordClick}
            className="w-full bg-[#800000] hover:bg-[#990909] text-white font-medium py-2 rounded transition mt-10"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;