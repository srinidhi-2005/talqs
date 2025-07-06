import { useAuth } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import BeamsBackground from "../components/BeamsBackground";
import ModernFileUpload from "../components/ModernFileUpload";
import { useEffect, useRef, useState } from "react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQABot, setShowQABot] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");
  const [chat, setChat] = useState([]); // { sender: 'user'|'bot', text: string }
  const summaryRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("newchat")) {
      setInputText("");
      setFile(null);
      setSummary("");
      setError("");
      setQaInput("");
      setQaError("");
      setChat([]);
      window.history.replaceState({}, document.title, "/home");
    }
  }, [location.search]);

  useEffect(() => {
    if (showQABot && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, showQABot]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6]">
        <h2 className="text-3xl font-bold mb-6 text-[#800000]">Please log in to use Talqs AI</h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-[#800000] text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-[#990909] transition"
        >
          Login
        </button>
      </div>
    );
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setInputText("");
    setSummary("");
    setError("");
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    setFile(null);
    setSummary("");
    setError("");
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setSummary("");
    try {
      let res, data;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData
        });
      } else if (inputText.trim()) {
        const blob = new Blob([inputText], { type: "text/plain" });
        const formData = new FormData();
        formData.append("file", blob, "input.txt");
        res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData
        });
      } else {
        setError("Please upload a file or enter some text.");
        setLoading(false);
        return;
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to summarize");
      setSummary(data.summary);
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {}
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!qaInput.trim()) return;
    setQaLoading(true);
    setQaError("");
    setChat((prev) => [...prev, { sender: "user", text: qaInput }]);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ question: qaInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get answer");
      setChat((prev) => [...prev, { sender: "bot", text: data.answer }]);
      setQaInput("");
    } catch (err) {
      setQaError(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden">
      <BeamsBackground />
      <div className="absolute top-0 left-0 w-full z-30">
        <Navbar />
      </div>
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen w-full pt-32 pb-12">
        <div className="flex w-full max-w-7xl mx-auto gap-8 mt-8">
          {/* Left 3/4: Upload/Text + Summary */}
          <div className="flex flex-[3] gap-8">
            {/* Upload/textarea */}
            <div className="flex-1 bg-white/90 rounded-2xl shadow-2xl p-8 min-w-[400px] max-w-xl backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-4 text-[#800000]">Summarize Document or Text</h2>
              <ModernFileUpload onFileSelect={handleFileSelect} />
              <div className="mb-4 text-center text-gray-500">or</div>
              <textarea
                value={inputText}
                onChange={handleTextChange}
                placeholder="Paste or type your text here..."
                className="w-full border border-gray-300 rounded p-3 min-h-[120px] focus:ring-2 focus:ring-[#800000] outline-none mb-4"
              />
              <button
                onClick={handleSummarize}
                className="w-full bg-[#800000] hover:bg-[#990909] text-white font-semibold py-3 rounded-lg transition text-lg mb-3"
                disabled={loading}
              >
                {loading ? "Summarizing..." : "Summarize"}
              </button>
              {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
            </div>
            {/* Summary output */}
            <div className="flex-1 bg-white/90 rounded-2xl shadow-2xl p-8 min-w-[400px] max-w-xl backdrop-blur-md flex flex-col" ref={summaryRef}>
              <h2 className="text-2xl font-bold mb-4 text-[#800000]">Summary Output</h2>
              {summary ? (
                <>
                  <div className="mb-7 whitespace-pre-line break-words text-gray-800 bg-gray-100 rounded p-3 max-h-64 overflow-y-auto">{summary}</div>
                  <div className="flex gap-16 mt-7 mb-7">
                    <button onClick={handleDownload} className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#990909]">Download</button>
                    <button onClick={handleCopy} className="bg-gray-200 text-[#800000] px-4 py-2 rounded hover:bg-gray-300">Copy</button>
                  </div>
                  <div className="text-sm text-gray-500">Word count: {summary.trim().split(/\s+/).filter(Boolean).length}</div>
                </>
              ) : (
                <div className="text-gray-400 italic">No summary yet. Upload a document or enter text to summarize.</div>
              )}
            </div>
          </div>
          {/* Right 1/4: Empty for balance */}
          <div className="flex-1" />
        </div>
        {/* Floating QA Bot Button */}
        <button
          className="fixed bottom-8 right-8 z-40 bg-[#800000] text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-[#990909] transition"
          onClick={() => setShowQABot(true)}
        >
          Ask Questions
        </button>
        {/* QA Bot Modal */}
        {showQABot && (
          <div className="fixed inset-0 flex items-end justify-end z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-t-2xl shadow-2xl p-6 w-full max-w-sm m-8 relative animate-slide-up flex flex-col h-[500px]">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-[#800000] text-2xl"
                onClick={() => setShowQABot(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-2 text-[#800000]">Legal Q&A Bot</h3>
              <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded p-2">
                {chat.length === 0 && <div className="text-gray-400 text-center mt-8">Ask a question about your document...</div>}
                {chat.map((msg, idx) => (
                  <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 text-sm max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-[#e0e7ff] text-gray-900'
                          : 'bg-[#f3f4f6] text-[#800000] border border-[#e0e0e0]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="flex gap-2 mt-2" onSubmit={handleAskQuestion}>
                <input
                  type="text"
                  value={qaInput}
                  onChange={e => setQaInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  disabled={qaLoading}
                />
                <button
                  type="submit"
                  className="bg-[#800000] text-white px-4 py-2 rounded"
                  disabled={qaLoading || !qaInput.trim()}
                >
                  {qaLoading ? "..." : "Send"}
                </button>
              </form>
              {qaError && <div className="text-red-600 mt-2 text-center">{qaError}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;