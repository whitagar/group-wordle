import { Typography } from '@mui/material';
import { LocalStorageKeys } from '../../../util/LocalStorageKeys';

export const GameOver = () => {
  const winner = localStorage.getItem(LocalStorageKeys.WinningUsername);
  const score = localStorage.getItem(LocalStorageKeys.HighScore);
  const allScores = JSON.parse(localStorage.getItem(LocalStorageKeys.FinalScores));

  const allScoresList = Object.keys(allScores).map(function (key, index) {
    return (
      <Typography key={index}>
        {key}: {allScores[key]}
      </Typography>
    );
  });
  return (
    <>
      <Typography>Winner: {winner}</Typography>
      <Typography>Score: {score}</Typography>
      <Typography>All scores: {allScoresList}</Typography>
    </>
  );
};
