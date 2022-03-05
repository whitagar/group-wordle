import { Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DictionaryService } from '../../../../services/DictionaryService';
import { setWord } from '../../../../services/socket';

export function ChooseWord() {
  const [typedWord, setTypedWord] = useState('');
  const [wordSubmitted, setWordSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { id } = useParams();

  const handleSubmitWord = () => {
    if (typedWord.length !== 5) {
      setErrorMessage('Length of word must be 5 letters');
    } else if (DictionaryService.isValidWordWithTrie(typedWord)) {
      console.log('Setting word for this user with room ID: ', id);
      setWord(id, typedWord);
      setWordSubmitted(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Word must be a real word');
    }
  };

  return (
    <>
      {errorMessage.length > 0 && <Typography color="red">{errorMessage}</Typography>}
      {wordSubmitted ? (
        <Typography>Wait for other players to finish choosing word.</Typography>
      ) : (
        <>
          <Typography>
            Please enter any real 5 letter word. This will be the word that all other players have to guess.
          </Typography>

          <TextField
            variant={'outlined'}
            label={'Choose your word'}
            onChange={(event) => setTypedWord(event.target.value)}
          />
          <Button variant="contained" onClick={handleSubmitWord}>
            Submit
          </Button>
        </>
      )}
    </>
  );
}
