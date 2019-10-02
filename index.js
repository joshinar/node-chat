const path = require("path");
const moment = require("moment");
const express = require("express");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.port || 5000;
const publicDirectoryPath = path.join(__dirname, "public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", "Admin", `Welcome ${username}!`);
    socket.broadcast
      .to(user.room)
      .emit("message", "", `${user.username} has joined`);
    io.to(user.room).emit("roomsData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });

  socket.on("newMessage", data => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "message",
      `${user.username}`,
      `<span class="text-muted mr-4">${moment().format(
        "h:mm a"
      )} -</span> ${data}`
    );
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        "",
        `${user.username} has left the chat`
      );
      io.to(user.room).emit("roomsData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "message",
      `${user.username}`,
      `<span class="text-muted mr-4">${moment().format(
        "h:mm a"
      )} -</span> <a href="https://google.com/maps?q=${coords.latitude},${
        coords.longitude
      }" target="_blank">My Location</a>`
    );

    callback();
  });
});

http.listen(port, () => console.log(`server started on ${port}`));
