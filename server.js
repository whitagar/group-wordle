var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");

// add middlewares
app.use(express.static(path.join(__dirname, "build")));
app.use(express.static("public"));

// Running our server on port 10986
const PORT = process.env.PORT || 8080;

var server = app.listen(PORT, function () {
  var port = server.address().port;
  console.log("Listening on %s", port);
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build"));
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var io = require("socket.io")(server);

var connectedClients = {};
var rooms = {};

io.on("connection", (client) => {
  console.log("New client connected");

  //Client sent a message
  client.on("SendMessage", (messageData, roomId) => {
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    room.chatRoomData.push(messageData);
    sendUpdatedChatRoomData(room);
    console.log("new message sent to room: ", roomId, messageData.message);
  });

  //Client created room
  client.on("CreateRoom", (roomId) => {
    rooms[roomId] = {
      id: roomId,
      clientsInRoom: [],
      chatRoomData: [],
      playersInGame: {},
      gameHasStarted: false,
      gameHasFinished: false,
      currentRound: {},
    };
    console.log("Created room: ", roomId);
  });

  //Client entered the chat room
  client.on("UserEnteredRoom", (userData, roomId) => {
    console.log("client entered room", userData);
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    var enteredRoomMessage = {
      message: `${userData.username} has entered the waiting room`,
      username: userData.username,
      userID: userData.id,
      timeStamp: new Date(),
    };
    if (room) {
      room.chatRoomData.push(enteredRoomMessage);
      connectedClients[client.id] = userData;
      room.clientsInRoom.push(client);
      sendUpdatedChatRoomData(room);
      sendUpdatedPlayersList(room);
    }
  });

  client.on("LeaveRoom", (roomId) => {
    const userData = connectedClients[client.id];
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    console.log(userData.username + " is leaving room...");
    const newClientsInRoom = room.clientsInRoom.filter(
      (c) => c.id !== client.id
    );
    room["clientsInRoom"] = newClientsInRoom;
    var leftRoomMessage = {
      message: `${userData.username} has left the game`,
      username: userData.username,
      userID: userData.id,
      timeStamp: new Date(),
    };
    room.chatRoomData.push(leftRoomMessage);
    sendUpdatedChatRoomData(room);
    sendUpdatedPlayersList(room);
  });

  //Player Disconnecting from chat room...
  client.on("disconnecting", () => {
    console.log("Client disconnecting...");
    if (!connectedClients[client.id]) {
      return;
    }
    const userId = connectedClients[client.id]?.id;
    let room;
    let roomId;

    Object.entries(rooms).some((roomObject) => {
      roomId = roomObject[0];
      room = roomObject[1];
      const player = Object.values(room.playersInGame).find((player) => {
        return player.id === userId;
      });
      if (player) {
        return true;
      }
      return false;
    });

    if (connectedClients[client.id]) {
      var leftRoomMessage = {
        message: `${connectedClients[client.id].username} has left the chat`,
        username: "",
        userID: 0,
        timeStamp: null,
      };
      room["clientsInRoom"] = room.clientsInRoom.filter(
        (c) => c.id !== client.id
      );
      room.chatRoomData.push(leftRoomMessage);
      if (room.id === connectedClients[client.id].id) {
        tearDownRoom(roomId);
      } else {
        sendUpdatedChatRoomData(room);
        sendUpdatedPlayersList(room);
      }

      delete connectedClients[client.id];
    }
  });

  //Clearing Chat room data from server
  client.on("ClearChat", (roomId) => {
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    room.chatRoomData = [];
    console.log(room.chatRoomData);
    sendUpdatedChatRoomData(room);
  });

  // Host starts game
  client.on("HostStartGame", (roomId) => {
    console.log("Host starting game: ", roomId);
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    room.clientsInRoom.forEach((client) => {
      const userData = connectedClients[client.id];
      room.playersInGame[userData.id] = userData;
    });
    sendStartGame(room);
  });

  //Player chooses word
  client.on("SetWord", (roomId, word) => {
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    var userData = connectedClients[client.id];
    userData.hasWord = true;
    userData.word = word;
    connectedClients[client.id] = userData;
    console.log(`${userData.username} set their word to ${userData.word}`);
    checkIfAllPlayersHaveSetWord(roomId);
  });

  client.on("SetRoundScore", (roomId, roundId, score) => {
    let room = rooms[roomId];
    if (!room) {
      kick(client);
      return;
    }
    var userData = connectedClients[client.id];
    userData.scores[roundId] = score;

    connectedClients[client.id] = userData;
    room.playersInGame[userData.id] = userData;
    console.log(
      `${userData.username} got a score of ${score} in round ${roundId}`
    );
    checkIfAllPlayersHaveRoundScore(roomId, roundId);
  });

  client.on("CheckForCurrentGame", (userId) => {
    Object.entries(rooms).some((roomObject) => {
      const roomId = roomObject[0];
      const room = roomObject[1];
      const player = Object.values(room.playersInGame).find((player) => {
        return player.id === userId;
      });
      if (player) {
        connectedClients[client.id] = player;
        RejoinGame(client, roomId);
        return true;
      }
      return false;
    });
  });
});

//Sending update chat room data to all connected clients
function sendUpdatedChatRoomData(room) {
  room.clientsInRoom.forEach((c) => {
    c.emit("RetrieveChatRoomData", room.chatRoomData);
    console.log("Sending updated chat room data to", connectedClients[c.id]);
  });
}

//Send updated list of players
function sendUpdatedPlayersList(room) {
  var playersList = [];
  room.clientsInRoom.forEach((c) => {
    playersList.push(connectedClients[c.id]);
  });
  console.log("players list: ", playersList);
  room.clientsInRoom.forEach((c) => {
    c.emit("RetrievePlayersList", playersList);
    console.log("sending players list to: ", connectedClients[c.id]);
  });
}

function tearDownRoom(roomId) {
  let room = rooms[roomId];

  room.clientsInRoom.forEach((c) => {
    c.emit("RoomDestroyed");
  });
  console.log("Destroying room");
  delete rooms[roomId];
}

function kick(client) {
  client.emit("RoomNotAvailable");
  console.log("Room was not available");
}

function sendStartGame(room) {
  room.gameHasStarted = true;
  room.clientsInRoom.forEach((c) => {
    c.emit("StartGame");
  });
  console.log("Game starting with id: ", room.id);
}

function checkIfAllPlayersHaveSetWord(roomId) {
  let room = rooms[roomId];
  if (
    room.clientsInRoom.every((c) => {
      return connectedClients[c.id].hasWord;
    })
  ) {
    let wordsMap = {};
    room.clientsInRoom.forEach((c) => {
      wordsMap[connectedClients[c.id].id] = connectedClients[c.id].word;
    });
    room.clientsInRoom.forEach((c) => {
      c.emit("SetWordsMap", wordsMap);
    });
    startNextRound(roomId);
  }
}

function checkIfAllPlayersHaveRoundScore(roomId, roundId) {
  let room = rooms[roomId];
  if (
    room.clientsInRoom.every((c) => {
      return roundId in connectedClients[c.id].scores;
    })
  ) {
    console.log("players in game: ", room.playersInGame);
    Object.values(room.playersInGame).forEach((player) => {
      if (!player["scores"]) {
        room.playersInGame[player.id].scores = {
          [roundId]: 0,
        };
      } else if (!(roundId in player.scores)) {
        room.playersInGame[player.id].scores[roundId] = 0;
      }
    });
    console.log("All players have round score. Moving to next round.");
    startNextRound(roomId);
  } else {
    console.log("Waiting for all players to have round score.");
  }
}

function startNextRound(roomId) {
  let room = rooms[roomId];
  if (
    room.clientsInRoom.every((c) => {
      return connectedClients[c.id].turnTaken;
    })
  ) {
    room.gameHasFinished = true;
    let allScores = {};
    let maxScore = 0;
    let winningUsername = "";
    Object.values(room.playersInGame).forEach((player) => {
      const totalScore = Object.values(player.scores).reduce(
        (partialSum, score) => partialSum + score,
        0
      );
      const username = player.username;
      allScores[username] = totalScore;
      if (totalScore >= maxScore) {
        maxScore = totalScore;
        winningUsername = username;
      }
    });
    room.clientsInRoom.forEach((c) => {
      c.emit("GameOver", allScores, maxScore, winningUsername);
    });
    console.log("Game over. Tearing down room");
    tearDownRoom(roomId);
  } else {
    let nextPlayer = room.clientsInRoom.find((c) => {
      return !connectedClients[c.id].turnTaken;
    });
    connectedClients[nextPlayer.id].turnTaken = true;
    room.playersInGame[connectedClients[nextPlayer.id].id].turnTaken = true;
    const word = connectedClients[nextPlayer.id].word;
    const id = connectedClients[nextPlayer.id].id;
    room.clientsInRoom.forEach((c) => {
      c.emit("StartRound", word, id);
    });
    room.currentRound = { word: word, id: id };
    console.log("Starting new round...");
  }
}

function RejoinGame(client, roomId) {
  const userData = connectedClients[client.id];
  console.log("client entered room", userData);
  let room = rooms[roomId];
  if (!room) {
    kick(client);
    return;
  }
  var enteredRoomMessage = {
    message: `${userData.username} has entered the waiting room`,
    username: userData.username,
    userID: userData.id,
    timeStamp: new Date(),
  };
  if (room && !room.gameHasFinished) {
    room.chatRoomData.push(enteredRoomMessage);
    room.clientsInRoom = room.clientsInRoom.filter((c) => {
      return (
        connectedClients[c.id].username !== connectedClients[client.id].username
      );
    });
    room.clientsInRoom.push(client);
    console.log("Found unfinished game for player. room: ", room);
    console.log("new list of clients in room: ", room.clientsInRoom);
    sendUpdatedChatRoomData(room);
    sendUpdatedPlayersList(room);
  }
  if (room && room.gameHasStarted) {
    const hasGuessedThisRound = room.currentRound.id in userData.scores;
    client.emit(
      "RejoinGame",
      room.id,
      room.currentRound.word,
      room.currentRound.id,
      hasGuessedThisRound
    );
  }
}
