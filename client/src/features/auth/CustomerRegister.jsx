import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
import { User, Mail, Lock, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CustomerRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // handled by store
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-mandap-pattern">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-royal-maroon-700 border-2 border-royal-gold-400 shadow-royal mb-4">
            <DiyaMotif className="w-8 h-8 text-royal-gold-300" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-royal-maroon-800 tracking-wide">
            Begin Your Sacred Union
          </h1>
          <p className="text-sm text-royal-brown-600 mt-2">
            Create an account to design, preserve, and share your wedding celebration
          </p>
          <FloralDivider className="w-32 h-3 text-royal-gold-500 mx-auto mt-3" />
        </div>

        {/* Card */}
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
                label="Full Name (Bride or Groom)"
                type="text"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: null }));
                }}
                error={fieldErrors.name}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="priya.rohan@wedding.com"
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
                label="Password (min 8 characters)"
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

            <div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: null }));
                }}
                error={fieldErrors.confirmPassword}
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
              <span>Create Account</span>
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-royal-brown-700">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-royal-maroon-700 hover:text-royal-maroon-900 underline underline-offset-2 ml-1"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
