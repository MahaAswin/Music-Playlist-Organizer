import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(formData);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo poppins" style={{ justifyContent: 'center', marginBottom: '30px' }}>
          <span>🎵 Musify</span>
        </div>
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '25px', color: 'var(--text-dim)' }}>
          New to Musify? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;