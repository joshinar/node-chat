let sendBtn = document.querySelector("#sendBtn");
let sendLoc = document.querySelector("#sendLoc");
let input = document.querySelector("#input");
let ul = document.querySelector("ul");
let roomName = document.querySelector("#roomName");
let usersList = document.querySelector("#usersList");
let socket = io();

// options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on("message", (user, message) => {
  let li = document.createElement("li");
  li.className = "list-group-item text-center";

  if (message) {
    li.innerHTML = `<h5>${user}</h5> ${message}`;
    ul.appendChild(li);
  }

  console.log(message);
});

socket.on("roomsData", room => {
  roomName.textContent = ` Room Name : ${room.room}`;

  room.users.forEach(user => {
    let li = document.createElement("li");
    li.className = "list-group-item lead";
    li.textContent = user.username;
    if (usersList.innerText != user.username) usersList.append(li);
  });
  console.log(usersList);
});

sendBtn.addEventListener("click", e => {
  e.preventDefault();
  socket.emit("newMessage", input.value);
  input.value = "";
});

sendLoc.addEventListener("click", e => {
  e.preventDefault();
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
