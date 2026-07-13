"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error);
    }
  };
  return (
    <div className="min-h-screen flex w-full bg-[#FAF8F5] animate-fade-in">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#4A4737]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
        {/* Overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content Overlay */}
        <div className="relative w-full p-12 flex flex-col justify-between">
          <div>
            <h1 className="font-serif text-5xl text-white mb-4 tracking-tight drop-shadow-sm">
              Re-Wear
            </h1>
            <p className="text-[#F2E9DC] text-lg max-w-md leading-relaxed drop-shadow-sm">
              Curating timeless stories through pre-loved textiles.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="h-[1px] w-12 bg-white/60"></div>
            <span className="text-xs font-bold tracking-[0.2em] text-white/90">
              ETHICAL SOURCING
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex border-b border-[#EAE5DB] mb-12">
            <Link
              href="/login"
              className="flex-1 text-center py-4 text-xs font-bold tracking-wider text-[#2D2D2A] border-b-2 border-[#2D2D2A] -mb-[1px]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-4 text-xs font-bold tracking-wider text-[#8B8B88] hover:text-[#2D2D2A] transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="font-serif text-[2.5rem] text-[#2D2D2A] mb-3 leading-none">
              Welcome Back
            </h2>
            <p className="text-[#5C5C58] text-[0.95rem]">
              Access your curated collection of vintage finds.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-xs font-semibold text-[#8B8B88] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full pb-3 bg-transparent border-b border-[#D8D2C8] text-[#2D2D2A] placeholder-[#B5B0A6] focus:border-[#2D2D2A] focus:outline-none transition-colors text-[0.95rem]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-[#8B8B88] uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-[#C57B57] hover:text-[#A66648] transition-colors">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pb-3 bg-transparent border-b border-[#D8D2C8] text-[#2D2D2A] placeholder-[#B5B0A6] focus:border-[#2D2D2A] focus:outline-none transition-colors text-[0.95rem]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-[#4A533D] hover:bg-[#3D4532] text-white rounded-xl font-semibold text-[0.95rem] transition-colors shadow-sm"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-[#EAE5DB]"></div>
            <span className="px-4 text-xs font-medium text-[#8B8B88]">or continue with</span>
            <div className="flex-grow border-t border-[#EAE5DB]"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#EAE5DB] hover:bg-[#FAF8F5] rounded-xl text-sm font-semibold text-[#2D2D2A] transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#EAE5DB] hover:bg-[#FAF8F5] rounded-xl text-sm font-semibold text-[#2D2D2A] transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.71 1.5.15 2.76.77 3.63 1.88-3.2 1.76-2.67 6.17.4 7.34-.73 1.58-1.55 3.04-2.84 3.66zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.3 2.3-1.89 4.13-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Footer Badge */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F1F4EB] rounded-full">
              <Leaf className="w-3.5 h-3.5 text-[#5F6B4E]" />
              <span className="text-xs font-semibold text-[#5F6B4E]">Carbon Neutral Marketplace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
