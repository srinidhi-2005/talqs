import { useState } from "react";

const Results = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return setError("Please enter a question.");
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get answer");
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-[#800000]">Ask a Question</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question..."
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />
        <button type="submit" className="bg-[#800000] text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Getting Answer..." : "Ask"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {answer && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <div className="font-semibold mb-2">Answer:</div>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
};

export default Results;