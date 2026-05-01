export default function Message({ role, content }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-lg px-4 py-2 rounded-lg ${
          role === "user"
            ? "bg-blue-600"
            : "bg-[#444654]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}