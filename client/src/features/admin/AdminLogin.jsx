import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api.js';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';

export const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@shaadivibe.com');
  const [password, setPassword] = useState('Admin@123456');
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
        className="w-full max-w-md p-8 sm:p-10 text-center bg-royal-ivory-card border-2 border-royal-gold-500/50 shadow-royal-lg"
      >
        <div className="w-14 h-14 rounded-full bg-royal-maroon-700 border-2 border-royal-gold-400 flex items-center justify-center text-royal-gold-300 mx-auto mb-3 shadow-royal">
          <Shield className="w-7 h-7" />
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-maroon-800">
          Admin Portal Login
        </h2>
        <p className="text-xs uppercase tracking-widest text-royal-gold-700 font-semibold mt-1">
          ShaadiVibe Management Suite
        </p>
        <FloralDivider className="w-36 h-3 text-royal-gold-500 mx-auto my-4" />

        {error && (
          <div className="p-3 mb-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
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
            placeholder="admin@shaadivibe.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
          />

          <div className="p-3 bg-royal-gold-50 rounded-lg border border-royal-gold-300/60 text-[11px] text-royal-brown-700">
            <strong>Dev Credentials:</strong> admin@shaadivibe.com / Admin@123456
          </div>

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
