import { Button, Typography } from '@mui/material';
import { useEasybase } from 'easybase-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameIdByCode } from '../../services/GameService';
import { CreatePlayer } from '../../services/PlayerService';
import { LocalStorageKeys } from '../../util/LocalStorageKeys';

const Join = () => {
  const { db, e } = useEasybase();
  const navigate = useNavigate();
  const [gameId, setGameId] = useState(undefined);
  const [username, setUsername] = useState(undefined);

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.IsHost, 'f');
  });

  useEffect(() => {
    if (gameId && username) {
      CreatePlayer(username, gameId, db);
      navigate(`/game/play/${gameId}/wait`);
    }
  }, [gameId, username, navigate, db]);

  const handleJoinGame = async () => {
    let code = prompt('Please enter the 4 digit code');
    setGameId(await GameIdByCode(code, db, e));

    if (localStorage[LocalStorageKeys.Username]) {
      setUsername(localStorage[LocalStorageKeys.Username]);
      return;
    }

    let nameTaken;
    let chosenName;
    while (!chosenName || nameTaken) {
      chosenName = prompt(`${nameTaken ? 'That one is taken. ' : ''}What is your username`);
      if (chosenName) {
        nameTaken = false;
        setUsername(chosenName);
      } else {
        nameTaken = true;
      }
    }
  };

  return (
    <div>
      <h2>Join</h2>
      <Button variant={'contained'} onClick={handleJoinGame}>
        Join a game
      </Button>
      {gameId && <Typography>Game found</Typography>}
    </div>
  );
};

export default Join;
