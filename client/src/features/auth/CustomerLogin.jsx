import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
import { Mail, Lock, Heart, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // handled by store
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-mandap-pattern">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-royal-maroon-700 border-2 border-royal-gold-400 shadow-royal mb-4">
            <DiyaMotif className="w-8 h-8 text-royal-gold-300" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-royal-maroon-800 tracking-wide">
            Welcome Back to Shaadi<span className="text-royal-gold-600">Vibe</span>
          </h1>
          <p className="text-sm text-royal-brown-600 mt-2">
            Sign in to manage and share your royal wedding celebrations
          </p>
          <FloralDivider className="w-32 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        {/* Form Container */}
        <div className="bg-royal-ivory-card border border-royal-gold-500/40 rounded-2xl p-6 sm:p-8 shadow-royal-lg backdrop-blur-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50/90 border border-red-300 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="bride.groom@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
                }}
                error={fieldErrors.email}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
                }}
                error={fieldErrors.password}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <Heart className="w-4 h-4 mr-2 text-royal-brown-950 fill-royal-brown-950" />
              <span>Sign In to Dashboard</span>
            </Button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-5 pt-4 border-t border-royal-gold-300/40 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@shaadivibe.com');
                setPassword('Admin@123456');
              }}
              className="text-xs font-semibold text-royal-gold-700 hover:text-royal-maroon-700 inline-flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Admin / Demo Credentials</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-royal-brown-700">
          <span>New to ShaadiVibe? </span>
          <Link
            to="/register"
            className="font-bold text-royal-maroon-700 hover:text-royal-maroon-900 underline underline-offset-2 ml-1"
          >
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};
