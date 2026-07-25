import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Camera from './pages/Camera';
import Result from './pages/Result';
import History from './pages/History';
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
    </div>
  );
}

export default App;