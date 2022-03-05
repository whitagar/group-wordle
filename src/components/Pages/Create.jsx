/* eslint-disable no-extend-native */
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CreateGame } from '../../services/GameService';
import { CreatePlayer } from '../../services/PlayerService';
import { useEasybase } from 'easybase-react';
import { LocalStorageKeys } from '../../util/LocalStorageKeys';
import { createRoom } from '../../services/socket';

function Create() {
  const { db } = useEasybase();
  const navigate = useNavigate();
  let name;
  let playerId;

  const handleCreateGame = () => {
    if (localStorage[LocalStorageKeys.Username]) {
      const storedName = localStorage[LocalStorageKeys.Username];
      name = storedName;
      playerId = storedName.hashCode();
    } else {
      name = prompt('Choose a username');
      playerId = name.hashCode();
      CreatePlayer(name, playerId, db);
    }
    let numPlayers;
    while (!numPlayers || isNaN(numPlayers)) {
      numPlayers = parseInt(prompt('How many players'));
    }
    const code = prompt('Choose any 4 digit code');

    CreateGame(numPlayers, playerId, code, db);
    createRoom(playerId);
    localStorage.setItem(LocalStorageKeys.PlayerId, playerId);
    localStorage.setItem(LocalStorageKeys.IsHost, true);
    localStorage.setItem(LocalStorageKeys.GameId, playerId);
    navigate(`/game/play/${playerId}/wait`);
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
