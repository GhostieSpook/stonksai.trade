const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, validateToken } = require('../services/authService');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// User registration
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const result = await registerUser({ email, password, firstName, lastName });
    
    if (result.success) {
      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await loginUser(email, password);
    
    if (result.success) {
      res.json({
        message: 'Login successful',
        user: result.user,
        token: result.token
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const result = await validateToken(token);
    
    if (result.valid) {
      res.json({ valid: true, user: result.user });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const result = await refreshUserToken(refreshToken);
    
    if (result.success) {
      res.json({
        token: result.token,
        refreshToken: result.refreshToken
      });
    } else {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await sendPasswordReset(email);
    
    if (result.success) {
      res.json({ message: 'Password reset email sent' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    const result = await resetPassword(token, newPassword);
    
    if (result.success) {
      res.json({ message: 'Password reset successful' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router; 