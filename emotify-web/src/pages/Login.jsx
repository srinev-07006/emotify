import React, { useState } from 'react';
import api from '../api';

function Login({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('camera');
    } catch {
      setError('Incorrect email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="auth-logo-mark">🎵</div>
        <div className="auth-title">Log in to Emotify</div>
      </div>
      <div className="auth-body">
        <div>
          <label className="input-label">Email address</label>
          <input className="input" type="email" placeholder="name@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={login} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        <div className="divider"><span>or</span></div>
        <button className="btn-secondary" onClick={() => navigate('register')}>
          Sign up for Emotify
        </button>
      </div>
    </div>
  );
}

export default Login;