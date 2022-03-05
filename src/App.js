import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Pages/Home';
import Join from './components/Pages/Join';
import Create from './components/Pages/Create';
import { Button } from '@mui/material';
import { Play } from './components/Play/Play';
import { useEffect } from 'react';
import { disconnectSocket, initiateSocket } from './services/socket';

function App() {
  useEffect(() => {
    initiateSocket();

    return () => {
      disconnectSocket();
    };
  }, []);
  return (
    <main>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <Routes>
        <Route
          path="/create"
          element={
            <>
              <Navbar />
              <Create />
            </>
          }
        />
        <Route
          path="/join"
          element={
            <>
              <Navbar />
              <Join />
            </>
          }
        />
        <Route path="/game/play/:id/*" element={<Play />} />
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
