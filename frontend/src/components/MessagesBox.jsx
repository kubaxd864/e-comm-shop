import { useState, useMemo } from "react";
import { socket } from "@/lib/socket";
import { fetcher } from "@/lib/fetcher";
import { useUser } from "@/hooks/useUser";
import useSWR from "swr";

export default function MessagesBox({
  roomId,
  roomClientId,
  roomClientEmail,
  title,
}) {
  const [message, setMessage] = useState("");
  const { user } = useUser();
  const { data, mutate } = useSWR(
    roomId ? `http://localhost:5000/api/messages/${roomId}` : null,
    fetcher,
  );

  const messages = useMemo(() => data?.messages ?? [], [data]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!roomId || message.trim() === "") return;
    socket.emit("sendMessage", { roomId, text: message }, (res) => {
      if (res?.ok) {
        mutate();
      } else {
        console.error(res?.error);
      }
    });
    setMessage("");
  };
  return (
    <div className="flex flex-col w-full md:w-3/4 gap-2">
      <div className="flex flex-col bg-bg-secondary rounded-2xl p-8">
        <p className="text-lg font-medium text-text-primary">
          {title ?? "Czat"}
        </p>
        {roomClientId != null && (
          <span className="text-sm text-text-secondary">{`${roomClientEmail} (#${roomClientId})`}</span>
        )}
      </div>
      <div className="flex flex-col h-full max-h-[500px] min-h-80 gap-5 bg-bg-secondary rounded-2xl p-8 overflow-hidden">
        <ul
          id="messages"
          className="flex flex-1 min-h-0 w-full flex-col gap-2 pr-2 overflow-y-auto hide-scrollbar"
        >
          {messages.map((message, idx) => {
            const isAuthor = message.sender_id === user.id;
            return (
              <li
                key={idx}
                className={`px-3 py-2 rounded text-text-primary ${
                  isAuthor ? "bg-primary self-end" : "bg-zinc-500 self-start"
                }`}
              >
                {message.content}
              </li>
            );
          })}
        </ul>
        <form onSubmit={sendMessage} className="w-full">
          <div className="flex flex-row gap-5">
            <input
              placeholder="Wiadomość"
              className="w-full bg-bg-accent p-4 rounded"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary py-3 px-6 rounded hover:bg-primary-hover"
            >
              Wyślij
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
