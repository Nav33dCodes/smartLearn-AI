import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const sendMessage = async (message) => {
  const res = await axios.post(`${API}/chat`, { message });
  return res.data.response;
};

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  await axios.post(`${API}/upload`, formData);
};