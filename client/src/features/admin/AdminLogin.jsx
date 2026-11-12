import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api.js';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider } from '../../components/common/Motifs.jsx';
import { Shield, Lock, AlertCircle } from 'lucide-react';

export const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (onLoginSuccess) onLoginSuccess(res.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Card
        ornate={true}
        className="w-full max-w-md p-6 sm:p-10 text-center bg-white border border-floral-gold/40 shadow-royal rounded-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-floral-burgundy border border-floral-gold flex items-center justify-center text-floral-gold mx-auto mb-3 shadow-royal">
          <Shield className="w-6 h-6" />
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-floral-burgundy">
          Admin Portal Login
        </h2>
        <p className="text-xs uppercase tracking-widest text-floral-gold font-semibold mt-1">
          ShaadiVibe Management Suite
        </p>
        <FloralDivider className="w-36 h-3 text-floral-gold mx-auto my-3" />

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            <Lock className="w-4 h-4 mr-2" />
            Authenticate & Access Portal
          </Button>
        </form>
      </Card>
    </div>
  );
};
