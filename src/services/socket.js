import socketIOClient from 'socket.io-client';
import { LocalStorageKeys } from '../util/LocalStorageKeys';

const serverEndpoint = 'ws://localhost:3080';

const socket = socketIOClient(serverEndpoint, {
  transports: ['websocket'],
});

export const initiateSocket = (roomId) => {
  console.log('Connecting socket...');
};

export const disconnectSocket = (roomId) => {
  console.log('Disconnecting socket...');
  if (socket) {
    socket.disconnect(roomId);
  }
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
  socket.emit('UserEnteredRoom', { username: username, id: playerId }, roomId);
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
