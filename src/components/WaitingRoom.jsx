import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LocalStorageKeys } from '../util/LocalStorageKeys';
import { Button, TextField, Typography } from '@mui/material';
import {
  initiateSocket,
  subscribeToRoomChat,
  subscribeToRoomPlayersList,
  enterRoom,
  clearChat,
  disconnectSocket,
  sendChat,
} from '../services/socket';

const WaitingRoom = () => {
  // eslint-disable-next-line react/prop-types
  const { id } = useParams();
  const playerId = localStorage[LocalStorageKeys.PlayerId];
  const isHost = playerId === id;
  const [chats, setChats] = useState(JSON.parse(localStorage[LocalStorageKeys.ChatRoomData]) ?? []);
  const [playersList, setPlayersList] = useState(JSON.parse(localStorage[LocalStorageKeys.PlayersList]) ?? []);
  const [typedMessage, setTypedMessage] = useState('');
  const username = localStorage[LocalStorageKeys.Username];
  const navigate = useNavigate();

  useEffect(() => {
    initiateSocket(null);
    enterRoom(null, username, playerId);
    subscribeToRoomChat(null, (err, newChats) => {
      if (err) {
        return;
      }

      setChats(newChats);
    });

    subscribeToRoomPlayersList(null, (err, newPlayersList) => {
      if (err) {
        return;
      }

      setPlayersList(newPlayersList);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(LocalStorageKeys.PlayerId)) {
      navigate('/join');
    }
  });

  const handleStartGame = () => {
    navigate(`/game/play/${id}`);
  };

  const handleClearChat = () => {
    clearChat(null);
  };

  const handleSubmitChat = () => {
    sendChat(null, typedMessage, username);
    setTypedMessage('');
  };

  return (
    <div>
      <Typography>This is the waiting room.</Typography>
      <Typography>Username: {username ?? 'not found'}</Typography>
      {isHost && (
        <div>
          <Typography>You are the host.</Typography>
          <Button variant={'outlined'} onClick={handleStartGame}>
            Start Game
          </Button>
        </div>
      )}
      <br></br>
      <Typography>Players:</Typography>
      <ul>
        {playersList.map((player) => {
          if (!player) {
            return <div></div>;
          } else {
            return (
              <li key={player.id}>
                <Typography>
                  {player.id}: {player.username}
                </Typography>
              </li>
            );
          }
        })}
      </ul>
      <br></br>
      <Typography>Chats</Typography>
      {chats.map((chat, index) => {
        return (
          <div key={index}>
            <br></br>
            <Typography>{chat.message}</Typography>
          </div>
        );
      })}
      <TextField
        variant={'outlined'}
        label={'Send a message'}
        onChange={(event) => setTypedMessage(event.target.value)}
      ></TextField>
      <br></br>
      <Button variant={'contained'} onClick={handleSubmitChat}>
        Send Chat
      </Button>
      <Button variant={'outlined'} onClick={handleClearChat}>
        Clear Chat
      </Button>
    </div>
  );
};

export default WaitingRoom;
