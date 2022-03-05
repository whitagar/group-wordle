import { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import WaitingRoom from '../WaitingRoom';
import { PlayGame } from './PlayGame';
import {
  initiateSocket,
  subscribeToRoomNotAvailable,
  enterRoom,
  subscribeToRoomChat,
  subscribeToRoomPlayersList,
  subscribeToRoomDestroyed,
  subscribeToStartGame,
  subscribeToGameOver,
  subscribeToSetWordsMap,
  subscribeToStartRound,
  clearChat,
  hostStartGame,
  sendChat,
} from '../../services/socket';
import { useNavigate } from 'react-router-dom';
import { LocalStorageKeys } from '../../util/LocalStorageKeys';
import { useEasybase } from 'easybase-react';
import { DeleteGame } from '../../services/GameService';
import useWordsMap from '../../customHooks/useWordsMap';
import { GameOver } from './EndGame/GameOver';

export function Play() {
  const { id } = useParams();
  const { db, e } = useEasybase();
  const playerId = localStorage[LocalStorageKeys.PlayerId];
  const isHost = playerId === id;
  const [chats, setChats] = useState([]);
  const [playersList, setPlayersList] = useState([]);
  const username = localStorage[LocalStorageKeys.Username];
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [getWordsMap, setWordsMap] = useWordsMap();

  useEffect(() => {
    initiateSocket(id);
    setChats([]);
    setPlayersList([]);
    subscribeToRoomNotAvailable(id, () => {
      console.log('Room is not available right now');
      navigate('');
    });
    enterRoom(id, username, playerId);
    subscribeToRoomChat(id, (err, newChats) => {
      if (err) {
        return;
      }

      setChats(newChats);
    });

    subscribeToRoomPlayersList(id, (err, newPlayersList) => {
      if (err) {
        return;
      }

      setPlayersList(newPlayersList);
    });

    subscribeToRoomDestroyed(id, () => {
      console.log('Destroying room: ', id);
      if (isHost) {
        DeleteGame(id, db, e);
      }
    });

    subscribeToStartGame(id, () => {
      console.log('Game is starting...');
      navigate(`/game/play/${id}/playGame/chooseWord`);
    });

    subscribeToGameOver((allScores, maxScore, winningUsername) => {
      localStorage.setItem(LocalStorageKeys.FinalScores, JSON.stringify(allScores));
      localStorage.setItem(LocalStorageKeys.HighScore, maxScore.toString());
      localStorage.setItem(LocalStorageKeys.WinningUsername, winningUsername);
      navigate(`/game/play/${id}/gameOver`);
    });

    subscribeToSetWordsMap((wordsMap) => {
      setWordsMap(wordsMap);
    });

    subscribeToStartRound((word, playerId) => {
      let guessesArray = [];
      for (let i = 0; i < 6; ++i) {
        let guess = Array(word.length).fill('-');
        guessesArray.push(guess);
      }
      localStorage.setItem(LocalStorageKeys.Guesses, JSON.stringify(guessesArray));
      localStorage.setItem(LocalStorageKeys.CurrentGuess, JSON.stringify(1));
      localStorage.setItem(LocalStorageKeys.Score, JSON.stringify({ score: 0 }));
      console.log('starting new round...');
      navigate(`/game/play/${id}/playGame/${playerId}`);
    });
  }, []);

  const handleStartGame = () => {
    hostStartGame(id);
  };

  const handleClearChat = () => {
    clearChat(id);
  };

  const handleSubmitChat = (typedMessage) => {
    sendChat(id, typedMessage, username);
  };

  return (
    <>
      <Routes>
        <Route
          path="/wait"
          element={
            <WaitingRoom
              isHost={isHost}
              chats={chats}
              playersList={playersList}
              username={username}
              playerId={playerId}
              onSendChat={handleSubmitChat}
              onStartGame={handleStartGame}
              onClearChats={handleClearChat}
            />
          }
        />
        <Route path="/playGame/*" element={<PlayGame />} />
        <Route path="/gameOver" element={<GameOver />} />
      </Routes>
    </>
  );
}
