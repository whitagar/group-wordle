import socketIOClient from 'socket.io-client';
import { LocalStorageKeys } from '../util/LocalStorageKeys';

const serverEndpoint = 'ws://localhost:3080';

const socket = socketIOClient(serverEndpoint, {
  transports: ['websocket'],
});

export const initiateSocket = (room) => {
  console.log('Connecting socket...');
};

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if (socket) {
    socket.disconnect();
  }
};

export const subscribeToRoomChat = (room, callback) => {
  if (!socket) {
    return true;
  }
  socket.on('RetrieveChatRoomData', (chatRoomData) => {
    localStorage.setItem(LocalStorageKeys.ChatRoomData, JSON.stringify(chatRoomData));
    return callback(null, chatRoomData);
  });
};

export const subscribeToRoomPlayersList = (room, callback) => {
  socket.on('RetrievePlayersList', (list) => {
    localStorage.setItem(LocalStorageKeys.PlayersList, JSON.stringify(list));
    return callback(null, list);
  });
};

export const enterRoom = (room, username, playerId) => {
  socket.emit('UserEnteredRoom', { username: username, id: playerId });
};

export const clearChat = (room) => {
  socket.emit('ClearChat');
};

export const sendChat = (room, message, username) => {
  socket.emit('SendMessage', { message: message, username: username });
};
