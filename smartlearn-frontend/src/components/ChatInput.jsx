import { useState } from "react";
import { sendMessage } from "../api/api";

export default function ChatInput({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessage(input);

      setMessages([
        ...newMessages,
        { role: "bot", content: reply },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "bot", content: "Error getting response" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 border-t border-gray-700 flex gap-2">
      <input
        className="flex-1 p-2 rounded bg-[#40414f] outline-none"
        placeholder="Ask anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleSend}
        className="bg-green-600 px-4 rounded"
      >
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
}