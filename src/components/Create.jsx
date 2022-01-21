/* eslint-disable no-extend-native */
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CreateGame } from '../services/GameService';
import { CreatePlayer } from '../services/PlayerService';
import { useEasybase } from 'easybase-react';
import { LocalStorageKeys } from '../util/LocalStorageKeys';

function Create() {
  const { db } = useEasybase();
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const name = prompt('Choose a username');
    const playerId = name.hashCode();
    CreatePlayer(name, playerId, db);
    let numPlayers;
    while (!numPlayers || isNaN(numPlayers)) {
      numPlayers = parseInt(prompt('How many players'));
    }
    const code = prompt('Choose any 4 digit code');

    CreateGame(numPlayers, playerId, code, db);
    localStorage.setItem(LocalStorageKeys.PlayerId, playerId);
    localStorage.setItem(LocalStorageKeys.IsHost, true);
    localStorage.setItem(LocalStorageKeys.GameId, playerId);
    navigate(`/game/wait/${playerId}`);
  };

  return (
    <div>
      <h2>Create a game</h2>
      <Button variant={'contained'} onClick={handleCreateGame}>
        Create a game
      </Button>
    </div>
  );
}

export default Create;
