import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LocalStorageKeys } from '../util/LocalStorageKeys';
import { Button, TextField, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';

const WaitingRoom = ({ chats, isHost, playersList, username, playerId, onSendChat, onStartGame, onClearChats }) => {
  // eslint-disable-next-line react/prop-types
  const [typedMessage, setTypedMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(LocalStorageKeys.PlayerId)) {
      navigate('/join');
    }
  });

  const handleStartGame = () => {
    onStartGame();
  };

  const handleClearChat = () => {
    onClearChats();
  };

  const handleSubmitChat = () => {
    onSendChat(typedMessage);
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

WaitingRoom.propTypes = {
  chats: PropTypes.array.isRequired,
  playersList: PropTypes.array.isRequired,
  isHost: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  playerId: PropTypes.string.isRequired,
  onSendChat: PropTypes.func.isRequired,
  onStartGame: PropTypes.func.isRequired,
  onClearChats: PropTypes.func.isRequired,
};

export default WaitingRoom;
