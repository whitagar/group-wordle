import { io } from 'socket.io-client';
import { LocalStorageKeys } from '../util/LocalStorageKeys';

var socket;

export const initiateSocket = () => {
  socket = io();
  console.log('Connecting socket...');
  subscribeToConnect();
};

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if (socket) {
    socket.disconnect();
  }
};

export const subscribeToConnect = () => {
  socket.on('connect', () => {
    if (localStorage.getItem(LocalStorageKeys.PlayerId)) {
      checkForCurrentGame(localStorage.getItem(LocalStorageKeys.PlayerId));
    }
  });
};

export const checkForCurrentGame = (userId) => {
  socket.emit('CheckForCurrentGame', userId);
};

export const subscribeToRejoinGame = (callback) => {
  socket.on('RejoinGame', (roomId, word, id, hasGuessedThisRound) => {
    callback(roomId, word, id, hasGuessedThisRound);
  });
};

export const subscribeToRoomChat = (roomId, callback) => {
  if (!socket) {
    return true;
  }
  socket.on('RetrieveChatRoomData', (chatRoomData) => {
    localStorage.setItem(LocalStorageKeys.ChatRoomData, JSON.stringify(chatRoomData));
    return callback(null, chatRoomData);
  });
};

export const subscribeToRoomPlayersList = (roomId, callback) => {
  socket.on('RetrievePlayersList', (list) => {
    localStorage.setItem(LocalStorageKeys.PlayersList, JSON.stringify(list));
    return callback(null, list);
  });
};

export const enterRoom = (roomId, username, playerId) => {
  socket.emit(
    'UserEnteredRoom',
    { username: username, id: playerId, hasWord: false, word: '', turnTaken: false, scores: {} },
    roomId
  );
};

export const clearChat = (roomId) => {
  socket.emit('ClearChat', roomId);
};

export const sendChat = (roomId, message, username) => {
  socket.emit('SendMessage', { message: message, username: username }, roomId);
};

export const subscribeToRoomDestroyed = (roomId, callback) => {
  socket.on('RoomDestroyed', () => {
    localStorage.setItem(LocalStorageKeys.PlayersList, JSON.stringify([]));
    localStorage.setItem(LocalStorageKeys.ChatRoomData, JSON.stringify([]));
    return callback();
  });
};

export const subscribeToRoomNotAvailable = (roomId, callback) => {
  socket.on('RoomNotAvailable', () => {
    localStorage.setItem(LocalStorageKeys.PlayersList, JSON.stringify([]));
    localStorage.setItem(LocalStorageKeys.ChatRoomData, JSON.stringify([]));
    return callback();
  });
};

export const createRoom = (roomId) => {
  socket.emit('CreateRoom', roomId);
};

export const hostStartGame = (roomId) => {
  socket.emit('HostStartGame', roomId);
  console.log('Host started game... launching soon');
};

export const subscribeToStartGame = (roomId, callback) => {
  socket.on('StartGame', () => {
    return callback();
  });
};

export const setWord = (roomId, word) => {
  socket.emit('SetWord', roomId, word);
  console.log('Congrats, you chose your word. Now wait for all players to choose theirs!');
};

export const subscribeToStartRound = (callback) => {
  socket.on('StartRound', (word, id) => {
    return callback(word, id);
  });
};

export const subscribeToRejoinRound = (callback) => {
  socket.on('RejoinRound', (word, id) => {
    return callback(word, id);
  });
};

export const subscribeToGameOver = (callback) => {
  socket.on('GameOver', (allScores, maxScore, winningUsername) => {
    callback(allScores, maxScore, winningUsername);
  });
};

export const subscribeToSetWordsMap = (callback) => {
  socket.on('SetWordsMap', (wordsMap) => {
    callback(wordsMap);
  });
};

export const setRoundScore = (roomId, roundId, score) => {
  socket.emit('SetRoundScore', roomId, roundId, score);
  console.log('You got a score of: ', score);
};

export const leaveRoom = (roomId) => {
  socket.emit('LeaveRoom', roomId);
  console.log('You left the room.');
};
