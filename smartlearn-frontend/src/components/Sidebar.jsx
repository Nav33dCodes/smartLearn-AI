import { uploadPDF } from "../api/api";

export default function Sidebar({ setMessages }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await uploadPDF(file);
    alert("PDF Uploaded & Processed ✅");
  };

  return (
    <div className="w-64 bg-[#202123] p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-6">SmartLearn</h1>

      <button
        onClick={() => setMessages([])}
        className="bg-gray-700 p-2 rounded mb-4"
      >
        + New Chat
      </button>

      <label className="bg-blue-600 p-2 rounded cursor-pointer text-center">
        Upload PDF
        <input type="file" hidden onChange={handleUpload} />
      </label>
    </div>
  );
}