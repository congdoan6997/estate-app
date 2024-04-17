import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});
let onlineUsers = [];

const addUser = (userId, socketId) => {
  const existUser = onlineUsers.find((user) => user.userId === userId);
  if (!existUser) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(onlineUsers);
  });

  socket.on("sendMessage", (payload) => {
    console.log(payload);
    const receiver = getUser(payload.receiverId);
    if (!receiver) return;
    io.to(receiver.socketId).emit("getMessage", payload.data);
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(4000);
