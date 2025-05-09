import { useEffect, useState } from "react";
import "./App.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const listener = (msg: { type: string; payload: ChatMessage[] }) => {
      if (msg.type === "CHAT_MESSAGES") {
        setMessages(msg.payload);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div className="app-container">
      <h2>Conversation Nodes</h2>
      <div className="dot-list">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`dot ${m.role}`}
            title={`${m.role}: ${m.text}`}
          />
        ))}
      </div>
    </div>
  );
}
