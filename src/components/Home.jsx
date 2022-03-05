import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React from 'react';

function Home() {
  let navigate = useNavigate();

  return (
    <div>
      <h2>Home</h2>
      <Button
        variant="contained"
        onClick={() => {
          navigate('/create', { replace: true });
        }}
      >
        Create a game
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          navigate('/join', { replace: true });
        }}
      >
        Join a game
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          navigate('/play/test', { replace: true });
        }}
      >
        Test game
      </Button>
    </div>
  );
}

export default Home;
