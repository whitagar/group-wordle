import { Routes, Route } from 'react-router-dom';
import { ChooseWord } from './ChooseWord';
import Guess from './Guess/Guess';
import { RoundStart } from './RoundStart';

export function PlayGame() {
  return (
    <Routes>
      <Route path="/chooseWord" element={<ChooseWord />} />
      <Route path="/:playerId" element={<RoundStart />} />
      <Route path="/guess/:playerId" element={<Guess chances={6} numLetters={5} />} />
    </Routes>
  );
}
