import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Join from './components/Join';
import Create from './components/Create';
import { Button } from '@mui/material';
import Guess from './components/Play/Guess/Guess';
import { Play } from './components/Play/Play';
import { useEffect } from 'react';
import { disconnectSocket, initiateSocket } from './services/socket';

function App() {
  useEffect(() => {
    initiateSocket();

    return () => disconnectSocket();
  }, []);
  return (
    <main>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <Navbar />
      <Routes>
        <Route path="/create" element={<Create />} />
        <Route path="/join" element={<Join />} />
        <Route path="/game/play/:id/*" element={<Play />} />
        <Route path="/play/test" element={<Guess word={'monkey'} chances={6} numLetters={6} />} />
        <Route path="/" element={<Home />} exact />
        <Route element={Home} />
      </Routes>
    </main>
  );
}

function Navbar() {
  let navigate = useNavigate();
  return (
    <div>
      <ul>
        <li>
          <Button
            className="mb-3 mt-3"
            variant="contained"
            onClick={() => {
              navigate('/', { replace: true });
            }}
          >
            Home
          </Button>
        </li>
        <li>
          <Button
            className="mb-3 mt-3"
            variant="contained"
            onClick={() => {
              navigate('/create', { replace: true });
            }}
          >
            Create
          </Button>
        </li>
        <li>
          <Button
            className="mb-3 mt-3"
            variant="contained"
            onClick={() => {
              navigate('/join', { replace: true });
            }}
          >
            Join
          </Button>
        </li>
      </ul>
    </div>
  );
}

export default App;
