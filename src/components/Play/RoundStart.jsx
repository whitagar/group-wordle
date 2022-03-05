import { Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export const RoundStart = () => {
  const { playerId, id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Typography>Next up is the word chosen by player {playerId}</Typography>
      <Button
        variant="outlined"
        onClick={() => {
          navigate(`/game/play/${id}/playGame/guess/${playerId}`);
        }}
      >
        Start Guessing!
      </Button>
    </>
  );
};
