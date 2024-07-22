const { Server, Socket } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emaiTosocketIdMap = new Map();
const socketIdToEmailmap = new Map();

io.on("connection", (Socket) => {
  console.log(`Socket Connected`, Socket.id);
  Socket.on("room:join", (data) => {
    const { email, room } = data;
    emaiTosocketIdMap.set(email, Socket.id);
    socketIdToEmailmap.set(Socket.id, email);
    io.to(room).emit("user:joined", { email, id: Socket.id });
    Socket.join(room);
    io.to(Socket.id).emit("room:join", data);
  });

  Socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: Socket.id, offer });
  });

  Socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: Socket.id, answer });
  });

  Socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: Socket.id, offer });
  });

  Socket.on("peer: nego: done;", ({ to, answer }) => {
    io.to(to).emit("peer:nego:final", { from: Socket.id, answer });
  });
});
