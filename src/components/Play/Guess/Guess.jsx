import SingleGuess from './SingleGuess';
import { PropTypes } from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import { Button, Typography } from '@mui/material';
import { DictionaryService } from '../../../services/DictionaryService';
import ScoreService from '../../../services/ScoreService';
import { LocalStorageKeys } from '../../../util/LocalStorageKeys';
import useWordsMap from '../../../customHooks/useWordsMap';
import { useParams } from 'react-router-dom';
import { setRoundScore } from '../../../services/socket';

function Guess({ chances, numLetters, givenWord }) {
  const { id, playerId } = useParams();
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(1);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [foundWord, setFoundWord] = useState(false);
  const [score, setScore] = useState(0);
  const [getWordsMap] = useWordsMap();
  const getWordFromPlayerId = (playerId) => {
    return getWordsMap()[playerId];
  };
  const word = givenWord ? givenWord : getWordFromPlayerId(playerId);
  const layout = {
    default: ['q w e r t y u i o p', 'a s d f g h j k l {enter}', 'z x c v b n m {bksp}'],
  };
  const [keyColors, setKeyColors] = useState({});

  const clearBoard = useCallback(() => {
    let guessesArray = [];
    for (let i = 0; i < chances; ++i) {
      let guess = Array(numLetters).fill('-');
      guessesArray.push(guess);
    }
    setGuesses(guessesArray);
    setCurrentGuess(1);
    setScore(0);
    localStorage.setItem(LocalStorageKeys.Guesses, JSON.stringify(guessesArray));
    localStorage.setItem(LocalStorageKeys.CurrentGuess, JSON.stringify(1));
    localStorage.setItem(LocalStorageKeys.Score, JSON.stringify({ score: 0 }));
  }, [chances, numLetters]);

  useEffect(() => {
    if (
      localStorage.getItem(LocalStorageKeys.Score) === JSON.stringify({ score: 0 }) &&
      localStorage.getItem(LocalStorageKeys.CurrentGuess) === JSON.stringify(1)
    ) {
      clearBoard();
    }
  }, [playerId, clearBoard]);

  useEffect(() => {
    if (localStorage.getItem(LocalStorageKeys.Score)) {
      setScore(JSON.parse(localStorage.getItem(LocalStorageKeys.Score)).score);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(LocalStorageKeys.Guesses) && localStorage.getItem(LocalStorageKeys.CurrentGuess)) {
      setGuesses(JSON.parse(localStorage.getItem(LocalStorageKeys.Guesses)));
      setCurrentGuess(parseInt(localStorage.getItem(LocalStorageKeys.CurrentGuess)));
      return;
    }
    let guessesArray = [];
    for (let i = 0; i < chances; ++i) {
      let guess = Array(numLetters).fill('-');
      guessesArray.push(guess);
    }
    setGuesses(guessesArray);
    setCurrentGuess(1);
  }, [chances, numLetters]);

  const handleSetKeyColor = (color, letter) => {
    if (color === 'red') {
      if (keyColors[letter]) {
        return;
      } else {
        const colorMap = {
          [letter]: color,
          ...keyColors,
        };
        setKeyColors(colorMap);
      }
    } else {
      if (keyColors[letter]) {
        if (color === 'green') {
          const colorMap = {
            ...keyColors,
            [letter]: color,
          };
          setKeyColors(colorMap);
        } else {
          if (keyColors[letter] === 'green') {
            return;
          } else {
            const colorMap = {
              ...keyColors,
              [letter]: color,
            };
            setKeyColors(colorMap);
          }
        }
      } else {
        const colorMap = {
          [letter]: color,
          ...keyColors,
        };
        setKeyColors(colorMap);
      }
    }
  };

  const handleKeyboardChange = (input) => {
    return;
  };

  const handleKeyPress = (button) => {
    if (button === '{bksp}') {
      if (currentLetterIndex < 1) {
        return;
      }
      let tmp = guesses;
      tmp[currentGuess - 1][currentLetterIndex - 1] = '';
      setGuesses(tmp);
      setCurrentLetterIndex(currentLetterIndex - 1);
    } else if (button === '{enter}') {
      if (currentLetterIndex < numLetters - 1) {
        return;
      } else {
        const isValid = DictionaryService.isValidWordFast(guesses[currentGuess - 1].join(''));
        if (isValid) {
          let guessedCorrectly = guesses[currentGuess - 1].every((letter, index) => {
            return letter.toLowerCase() === word.toLowerCase().charAt(index);
          });
          if (guessedCorrectly) {
            setFoundWord(true);
            let score = JSON.parse(localStorage.getItem(LocalStorageKeys.Score))?.score ?? 0;
            score = score + ScoreService.calculateScore(currentGuess);
            setScore(score);
            localStorage.setItem(LocalStorageKeys.Score, JSON.stringify({ score: score }));
            setRoundScore(id, playerId, score);
            return;
          }
          if (currentGuess < chances) {
            setCurrentLetterIndex(0);
            setCurrentGuess(currentGuess + 1);
            localStorage.setItem(LocalStorageKeys.Guesses, JSON.stringify(guesses));
            localStorage.setItem(LocalStorageKeys.CurrentGuess, JSON.stringify(currentGuess));
          } else {
            localStorage.setItem(LocalStorageKeys.Guesses, JSON.stringify(guesses));
            localStorage.setItem(LocalStorageKeys.CurrentGuess, JSON.stringify(currentGuess));
            setRoundScore(id, playerId, 0);
            return;
          }
        } else {
          return;
        }
      }
    } else if (
      [
        '{tab}',
        '{lock}',
        '{shift}',
        '{space}',
        '.com',
        '@',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        '-',
        '=',
        ',',
        '.',
        '/',
        ';',
        "'",
        '[',
        ']',
        '\\',
        '`',
      ].includes(button)
    ) {
      return;
    } else {
      if (currentLetterIndex < numLetters) {
        let tmp = guesses;
        tmp[currentGuess - 1][currentLetterIndex] = button;
        setGuesses(tmp);
        setCurrentLetterIndex(currentLetterIndex + 1);
      } else {
        return;
      }
    }
  };

  return (
    <div>
      <Typography variant="h2">Score: {score}</Typography>
      {foundWord && <Typography variant="h3">You got it! Congrats!</Typography>}
      {guesses.map((guess, index) => {
        return (
          <SingleGuess
            key={index * 7 + 7}
            letters={guess}
            word={word}
            submitted={foundWord || currentGuess > index + 1}
            onSetKeyColor={handleSetKeyColor}
          />
        );
      })}
      <Keyboard onChange={handleKeyboardChange} onKeyPress={handleKeyPress} layout={layout} layoutName={'default'} />
      <Button variant={'contained'} onClick={clearBoard}>
        Clear History
      </Button>
    </div>
  );
}

Guess.propTypes = {
  chances: PropTypes.number.isRequired,
  numLetters: PropTypes.number.isRequired,
  givenWord: PropTypes.string,
  givenPlayerId: PropTypes.number,
};

export default Guess;
