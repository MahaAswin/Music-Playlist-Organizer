import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onRegister(formData);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card glass"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo poppins" style={{ justifyContent: 'center', marginBottom: '30px' }}>
          <span>🎵 Musify</span>
        </div>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
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
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Join Now'}
          </button>
        </form>
        <p style={{ marginTop: '25px', color: 'var(--text-dim)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;