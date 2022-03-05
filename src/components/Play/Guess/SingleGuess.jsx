import { Paper, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';
import { useEffect, useState } from 'react';

// eslint-disable-next-line no-extend-native
String.prototype.replaceAt = function (index, replacement) {
  if (index >= this.length) {
    return this.valueOf();
  }

  return this.substring(0, index) + replacement + this.substring(index + 1);
};

function SingleGuess({ letters, word, submitted, onSetKeyColor }) {
  const [colorArray, setColorArray] = useState(Array(letters.length).fill('white'));

  useEffect(() => {
    if (submitted) {
      let availableLetters = word.toLowerCase();
      let guessedLetters = [...letters];
      let newColorArray = [...colorArray];
      for (let i = 0; i < letters.length; i++) {
        if (guessedLetters[i].toLowerCase() === availableLetters.charAt(i)) {
          newColorArray[i] = 'green';
          availableLetters = availableLetters.replaceAt(i, '-');
          guessedLetters[i] = ' ';
        }
      }
      for (let i = 0; i < letters.length; i++) {
        if (availableLetters.includes(guessedLetters[i].toLowerCase())) {
          newColorArray[i] = 'yellow';
          let letterIndex = availableLetters.indexOf(letters[i]);
          availableLetters = availableLetters.replaceAt(letterIndex, '-');
          guessedLetters[i] = ' ';
        }
      }
      for (let i = 0; i < guessedLetters.length; i++) {
        if (guessedLetters[i] === '-') {
          newColorArray[i] = 'white';
        } else if (guessedLetters[i] !== ' ') {
          newColorArray[i] = 'red';
        }
      }
      setColorArray(newColorArray);
      newColorArray.forEach((color, index) => {
        onSetKeyColor(color, letters[index]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, letters.length, word, letters]);

  return (
    <div style={{ display: 'flex' }}>
      {letters.map((letter, index) => {
        return (
          <Paper
            sx={{
              display: 'flex',
              m: 1,
              p: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              width: 1 / letters.length,
              background: colorArray[index],
            }}
            flex-direction={'row'}
            key={index}
            elevation={2}
            square
          >
            <Typography className="single-letter">{letter}</Typography>
          </Paper>
        );
      })}
    </div>
  );
}

SingleGuess.propTypes = {
  letters: PropTypes.array.isRequired,
  word: PropTypes.string.isRequired,
  submitted: PropTypes.bool.isRequired,
  onSetKeyColor: PropTypes.func.isRequired,
};

export default SingleGuess;
