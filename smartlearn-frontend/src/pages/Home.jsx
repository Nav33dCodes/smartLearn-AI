import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";

export default function Home() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="flex h-screen bg-[#343541] text-white">
      <Sidebar setMessages={setMessages} />
      <Chat messages={messages} setMessages={setMessages} />
    </div>
  );
}