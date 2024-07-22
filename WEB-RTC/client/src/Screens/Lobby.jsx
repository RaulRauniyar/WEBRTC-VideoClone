import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../context/socketProvider";
import { useNavigate } from "react-router-dom";
import "./index.css";

export const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const socket = useSocket();

  const navigate = useNavigate();

  const handleJoinROom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinROom);
    return () => {
      socket.off("room:join", handleJoinROom);
    };
  });

  const handleSubmitt = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );
  return (
    <div className="lobby">
      <h1>Lobby</h1>
      <form
        style={{
          gap: "12px",
        }}
        onSubmit={handleSubmitt}
      >
        <label htmlFor="emai">Email Id</label>
        <input
          type={"email"}
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <label htmlFor="room">Room number </label>
        <input
          type={"room "}
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <br />

        <button>Join</button>
      </form>
    </div>
  );
};
