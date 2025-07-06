import { useLocation, useNavigate } from "react-router-dom";

const HistoryChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  if (!item) {
    return (
      <div className="p-8">
        <div className="text-red-600 mb-2">No history item found.</div>
        <button onClick={() => navigate("/history")} className="bg-[#800000] text-white px-4 py-2 rounded">Back to History</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-[#800000]">{item.type === 'summary' ? 'Summary' : 'Q&A'}</h2>
      <div className="mb-4">
        <div className="font-semibold">Input:</div>
        <div className="bg-gray-100 p-2 rounded">{item.input}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold">Output:</div>
        <div className="bg-gray-100 p-2 rounded">{item.output}</div>
      </div>
      <div className="text-gray-500 text-xs mb-4">{new Date(item.timestamp).toLocaleString()}</div>
      <button onClick={() => navigate("/history")} className="bg-[#800000] text-white px-4 py-2 rounded">Back to History</button>
    </div>
  );
};

export default HistoryChat; 