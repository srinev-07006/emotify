import React, { useState } from 'react';
import api from '../api';

function Register({ navigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('camera');
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="auth-logo-mark">🎵</div>
        <div className="auth-title">Create your account</div>
      </div>
      <div className="auth-body">
        <div>
          <label className="input-label">What's your name?</label>
          <input className="input" placeholder="Enter your name"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="input-label">Email address</label>
          <input className="input" type="email" placeholder="name@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="Create a password"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={register} disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <div className="divider"><span>or</span></div>
        <button className="btn-secondary" onClick={() => navigate('login')}>
          Log in instead
        </button>
      </div>
    </div>
  );
}

export default Register;