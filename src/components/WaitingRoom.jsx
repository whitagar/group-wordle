import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { LocalStorageKeys } from '../util/LocalStorageKeys';
import { Button, Typography } from '@mui/material';

const WEB_SOCKET_ADDRESS = 'ws://localhost:8080';

const WaitingRoom = (props) => {
  // eslint-disable-next-line react/prop-types
  const { id } = useParams();
  const isHost = localStorage.getItem(LocalStorageKeys.PlayerId) === id;
  const username = localStorage[LocalStorageKeys.Username];
  const navigate = useNavigate();
  const socketRef = useRef();

  useEffect(() => {
    if (!localStorage.getItem(LocalStorageKeys.PlayerId)) {
      navigate('/join');
    } else {
      socketRef.current = new WebSocket(WEB_SOCKET_ADDRESS);
      const socket = socketRef.current;

      socket.onopen = () => {};
    }
  });

  const handleStartGame = () => {
    navigate(`/game/play/${id}`);
  };

  return (
    <div>
      <Typography>This is the waiting room.</Typography>
      <Typography>Username: {username ?? 'not found'}</Typography>+
      {isHost && (
        <div>
          <Typography>You are the host.</Typography>
          <Button variant={'outlined'} onClick={handleStartGame}>
            Start Game
          </Button>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
