"use client";
import MessagesBox from "@/components/MessagesBox";
import { fetcher } from "@/lib/fetcher";
import { socket } from "@/lib/socket";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

const buildRoomTitle = (room) => {
  if (!room) return null;
  const roomType = room.context_type;
  const roomIdentifier = room.context_id;
  if (!roomType || roomIdentifier === undefined || roomIdentifier === null)
    return null;
  return roomType === "product"
    ? `Wiadomość odnośnie Produktu Nr: ${roomIdentifier}`
    : `Wiadomość odnośnie Zamówienia Nr: ${roomIdentifier}`;
};

export default function Messages() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? null;
  const id = searchParams.get("id") ?? null;
  const router = useRouter();
  const [roomId, setRoomId] = useState(null);
  const hasJoinedRef = useRef(false);
  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:5000/api/chat/get_rooms",
    fetcher,
  );
  const rooms = useMemo(() => data ?? [], [data]);

  const activeRoom = useMemo(() => {
    if (!type || !id) return null;
    return (
      rooms.find((room) => {
        const roomType = room.context_type;
        const roomIdentifier = room.context_id;
        return roomType === type && `${roomIdentifier}` === `${id}`;
      }) ?? null
    );
  }, [rooms, type, id]);

  const activeRoomTitle = useMemo(
    () => buildRoomTitle(activeRoom),
    [activeRoom],
  );
  const activeRoomClientId = useMemo(() => {
    if (!activeRoom) return null;
    return activeRoom.client_id ?? null;
  }, [activeRoom]);

  const activeRoomClientEmail = useMemo(() => {
    if (!activeRoom) return null;
    return activeRoom.client_email ?? null;
  }, [activeRoom]);

  const joinRoom = useCallback(() => {
    if (hasJoinedRef.current || !type || !id) return;
    socket.emit("joinOrCreateChat", { type, id }, (res) => {
      if (res?.ok) {
        setRoomId(res.roomId);
        hasJoinedRef.current = true;
        mutate();
      } else {
        console.error(res?.error);
      }
    });
  }, [id, type, mutate]);

  const handleSelectRoom = useCallback(
    (room) => {
      if (!room) return;
      const targetType = room.context_type ?? room.contextType;
      const targetId = room.context_id ?? room.contextId;
      if (!targetType || targetId === undefined || targetId === null) return;
      router.push(`/messages?type=${targetType}&id=${targetId}`);
    },
    [router],
  );

  useEffect(() => {
    hasJoinedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoomId(null);
  }, [type, id]);

  useEffect(() => {
    if (!type || !id) return;
    const handleConnect = () => {
      joinRoom();
    };
    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", handleConnect);
    return () => {
      socket.off("reconnect", handleConnect);
    };
  }, [joinRoom, type, id]);
  return (
    <div className="flex w-full h-full flex-col gap-7 justify-center items-center px-6 py-12">
      <div className="flex flex-col md:flex-row w-full md:w-11/12 lg:w-10/12 xl:w-9/12 h-full md:h-[600px] gap-2">
        <div className="flex flex-col w-full md:w-1/4 max-h-72 md:max-h-full gap-5 bg-bg-secondary rounded-2xl p-6">
          <p className="w-full text-xl">Chaty</p>
          <div className="flex flex-col gap-3 overflow-auto hide-scrollbar">
            {isLoading && (
              <div className="px-4 py-2 text-sm text-center text-text-secondary">
                Wczytywanie chatów...
              </div>
            )}
            {error && !isLoading && (
              <div className="rounded bg-red-900/60 px-4 py-2 text-sm text-center text-text-secondary">
                Błąd pobierania listy.
              </div>
            )}
            {!isLoading && !error && rooms.length === 0 && (
              <div className="px-4 py-2 text-sm text-center text-text-secondary">
                Brak chatów.
              </div>
            )}
            {!isLoading &&
              !error &&
              rooms.map((room, idx) => {
                const isActive = `${room.context_id}` === `${id}`;
                const title = buildRoomTitle(room);
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectRoom(room)}
                    className={`flex flex-col w-full rounded px-4 py-2 text-left transition ${isActive ? "border border-primary" : "border border-border text-text-secondary hover:cursor-pointer"}`}
                  >
                    <p className="text-sm truncate">
                      {room.client_email}
                      <span>{` (#${room.client_id})`}</span>
                    </p>
                    <p className="truncate">{title}</p>
                  </div>
                );
              })}
          </div>
        </div>
        {roomId !== null ? (
          <MessagesBox
            roomId={roomId}
            roomClientId={activeRoomClientId}
            roomClientEmail={activeRoomClientEmail}
            title={activeRoomTitle}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-bg-secondary">
            <p className="text-sm text-text-secondary">
              {type && id
                ? "Łączenie z czatem..."
                : "Wybierz Chat aby kontynuować rozmowę"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
