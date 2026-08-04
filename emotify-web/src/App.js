import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Camera from './pages/Camera';
import Result from './pages/Result';
import History from './pages/History';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('token')) setPage('camera');
  }, []);

  const navigate = (p, data) => {
    if (data) setResult(data);
    setPage(p);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setPage('login');
  };

  return (
    <div className="app">
      {page === 'login' && <Login navigate={navigate} />}
      {page === 'register' && <Register navigate={navigate} />}
      {page === 'camera' && <Camera navigate={navigate} logout={logout} />}
      {page === 'result' && <Result result={result} navigate={navigate} />}
      {page === 'history' && <History navigate={navigate} />}
      {page === 'playlists' && <Playlists navigate={navigate} />}
      {page === 'profile' && <Profile navigate={navigate} logout={logout} />}
    </div>
  );
}
export default App;