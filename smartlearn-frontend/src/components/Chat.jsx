import Message from "./Message";
import ChatInput from "./ChatInput";

export default function Chat({ messages, setMessages }) {
  return (
    <div className="flex flex-col flex-1">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
      </div>

      {/* Input */}
      <ChatInput messages={messages} setMessages={setMessages} />
    </div>
  );
}