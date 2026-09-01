import { useState } from "react";
import { askAssistant } from "../api";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Ask me about gate pass rules, parent approval, warden approval, QR, or return rules."
    }
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    const studentQuestion = question;

    setMessages([
      ...messages,
      {
        role: "student",
        text: studentQuestion
      }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const data = await askAssistant(studentQuestion);

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          role: "assistant",
          text: `${data.answer}`
        }
      ]);
    } catch (error) {
      setMessages((oldMessages) => [
        ...oldMessages,
        {
          role: "assistant",
          text: error.message
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-panel">
      <h2>AI Assistant</h2>

      <div className="assistant-messages">
        {messages.map((message, index) => (
          <div className={`assistant-message ${message.role}`} key={index}>
            {message.text}
          </div>
        ))}

        {loading && (
          <div className="assistant-message assistant">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="assistant-form">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about hostel pass rules..."
        />

        <button disabled={loading}>
          Ask
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;