import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
import { Heart, AlertCircle } from 'lucide-react';

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
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-floral-burgundy border border-floral-gold shadow-royal mb-3">
            <DiyaMotif className="w-6 h-6 text-floral-gold" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-floral-burgundy tracking-wide">
            Welcome Back to Shaadi<span className="text-floral-gold">Vibe</span>
          </h1>
          <p className="text-xs sm:text-sm text-floral-brown/85 mt-1.5">
            Sign in to manage and share your royal wedding celebrations
          </p>
          <FloralDivider className="w-32 h-3 text-floral-gold mx-auto mt-3" />
        </div>

        {/* Form Container */}
        <div className="bg-white border border-floral-gold/30 rounded-2xl p-6 sm:p-8 shadow-royal">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
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
              <Heart className="w-4 h-4 mr-2 text-floral-brown fill-floral-brown" />
              <span>Sign In to Dashboard</span>
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-floral-brown">
          <span>New to ShaadiVibe? </span>
          <Link
            to="/register"
            className="font-bold text-floral-burgundy hover:text-royal-maroon-900 underline underline-offset-2 ml-1"
          >
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};
