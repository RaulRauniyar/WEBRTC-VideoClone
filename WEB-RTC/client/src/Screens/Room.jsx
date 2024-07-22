import React, { useCallback, useState } from "react";

import { useEffect } from "react";
import { useSocket } from "../context/socketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import "./room.css";

export const RoomPage = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  });

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("Incoming call", from, offer);
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    const existingSenders = peer.peer
      .getSenders()
      .map((sender) => sender.track);
    console.log("send", existingSenders);

    for (const track of myStream.getTracks()) {
      if (!existingSenders.includes(track)) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream, peer.peer]);

  const handleCallAccepted = useCallback(
    ({ from, answer }) => {
      peer.setLocalDescription(answer);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeededIncoming = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, answer });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoFinal,
  ]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:negp:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  });

  const handluser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);
  return (
    <div className="room">
      <h1>Room Page</h1>
      <h1>{remoteSocketId ? "Connected" : "No one is in room "}</h1>
      {remoteSocketId && <button onClick={handluser}>Call</button>}

      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      <h2>My Stream</h2>
      {myStream && (
        <ReactPlayer
          playing
          muted
          width="200px"
          height={"200px"}
          url={myStream}
        />
      )}

      {remoteStream && (
        <ReactPlayer
          playing
          muted
          width="400px"
          height={"400px"}
          style={{
            marginLeft: "12px",
          }}
          url={remoteStream}
        />
      )}
    </div>
  );
};
