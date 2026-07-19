import React, { useState, useEffect } from 'react';
import { X, Eye, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const router = useRouter();
  const [view, setView] = useState(initialView); // 'login' or 'register'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginKeepSignedIn, setLoginKeepSignedIn] = useState(false);
  
  // Register State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [terms, setTerms] = useState(false);
  
  const [error, setError] = useState('');

  const { login, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
    }
  }, [isOpen, initialView]);

  const switchView = (newView) => {
    setView(newView);
    setError('');
  };

  const handleGoogleCustomLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        const result = loginWithGoogle({
          email: userInfo.email,
          name: userInfo.name || 'Google User',
          picture: userInfo.picture
        });

        if (result.success) {
          onClose();
          if (result.user?.role === 'admin' || result.user?.role === 'staff') {
            router.push('/admin');
          }
        } else if (result.action === 'register') {
          // Pre-fill and switch to register
          setFirstName(userInfo.given_name || userInfo.name?.split(' ')[0] || '');
          setLastName(userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '');
          setRegEmail(userInfo.email);
          switchView('register');
        }
      } catch (err) {
        setError('Error fetching Google user info');
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Please fill in both email and password.');
      return;
    }
    // Allow special usernames (admin, staff) or valid email format
    const isSpecialUser = loginEmail === 'admin' || loginEmail === 'staff';
    if (!isSpecialUser && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const result = login(loginEmail, loginPassword, loginKeepSignedIn);
    if (result.success) {
      onClose();
      if (result.user?.role === 'admin' || result.user?.role === 'staff') {
        router.push('/admin');
      }
    } else {
      setError(result.error);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !regEmail || !regPassword) {
      setError('Please fill in required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!terms) {
      setError('Please agree to the Terms of Use and Privacy Policy.');
      return;
    }

    const result = register(`${firstName.trim()} ${lastName.trim()}`.trim(), regEmail, regPassword, phone, keepSignedIn);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg p-8 sm:p-10 shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#2D2D2A] hover:text-[#C57B57] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {view === 'login' ? (
          <div>
            <h2 className="font-serif text-[2rem] font-bold text-[#2D2D2A] mb-8">Sign In</h2>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password *"
                  className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={loginKeepSignedIn} onChange={(e) => setLoginKeepSignedIn(e.target.checked)} className="w-4 h-4 accent-[#4A533D]" />
                  <span className="text-[#5C5C58]">Keep me signed in</span>
                </label>
                <a href="#" className="text-[#C57B57] hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#5F6B4E] hover:bg-[#4A543C] text-white font-bold tracking-widest uppercase transition-colors"
              >
                Sign In
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EAE5DB]"></div>
                </div>
                <div className="relative bg-white px-4 text-xs font-bold text-[#8B8B88] tracking-widest uppercase">
                  OR
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleCustomLogin()}
                className="w-full py-4 bg-white border border-[#EAE5DB] text-[#2D2D2A] font-bold tracking-widest uppercase hover:bg-[#F9F8F6] transition-colors flex items-center justify-center gap-3 mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-transparent border border-[#2D2D2A] text-[#2D2D2A] font-bold tracking-widest uppercase hover:bg-[#F9F8F6] transition-colors mt-4"
              >
                Cancel
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#EAE5DB] text-center text-sm font-bold tracking-wide uppercase text-[#2D2D2A]">
              Don't have an account?{' '}
              <button onClick={() => switchView('register')} className="underline hover:text-[#C57B57] ml-1">
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-serif text-[2rem] font-bold text-[#2D2D2A] leading-none">Create an Account</h2>
              <span className="text-xs text-[#8B8B88]">*Required</span>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name *"
                  className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name *"
                  className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm"
                />
              </div>

              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="EMAIL ADDRESS *"
                className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm uppercase-placeholder"
              />

              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create Password *"
                  className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-4 top-4 text-xs font-bold tracking-widest text-[#8B8B88] hover:text-[#2D2D2A] uppercase"
                >
                  {showRegPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="mt-4 mb-6">
                <p className="text-sm font-bold text-[#2D2D2A] mb-3">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-[#5C5C58]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${regPassword.length >= 8 ? 'text-green-600' : 'text-[#8B8B88]'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${/[A-Z]/.test(regPassword) ? 'text-green-600' : 'text-[#8B8B88]'}`} />
                    <span>At least 1 uppercase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${/[a-z]/.test(regPassword) ? 'text-green-600' : 'text-[#8B8B88]'}`} />
                    <span>At least 1 lowercase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${/[0-9]/.test(regPassword) ? 'text-green-600' : 'text-[#8B8B88]'}`} />
                    <span>At least 1 number</span>
                  </div>
                </div>
              </div>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(Optional) Phone Number"
                className="w-full p-4 bg-[#F9F8F6] text-[#2D2D2A] placeholder-[#8B8B88] focus:outline-none focus:ring-1 focus:ring-[#2D2D2A] transition-all text-sm"
              />

              <div className="space-y-3 mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} className="mt-1 w-4 h-4 accent-[#4A533D]" />
                  <span className="text-sm text-[#5C5C58]">Keep me signed in <span className="inline-block w-4 h-4 border border-[#8B8B88] rounded-full text-center leading-3 text-[10px] ml-1">?</span></span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 w-4 h-4 accent-[#4A533D]" />
                  <span className="text-sm text-[#5C5C58]">
                    I agree to the <a href="#" className="underline hover:text-[#2D2D2A]">Terms of Use</a> and <a href="#" className="underline hover:text-[#2D2D2A]">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-[#5F6B4E] hover:bg-[#4A543C] text-white font-bold tracking-widest uppercase transition-colors"
              >
                Submit
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EAE5DB]"></div>
                </div>
                <div className="relative bg-white px-4 text-xs font-bold text-[#8B8B88] tracking-widest uppercase">
                  OR
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleCustomLogin()}
                className="w-full py-4 bg-white border border-[#EAE5DB] text-[#2D2D2A] font-bold tracking-widest uppercase hover:bg-[#F9F8F6] transition-colors flex items-center justify-center gap-3 mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-transparent border border-[#2D2D2A] text-[#2D2D2A] font-bold tracking-widest uppercase hover:bg-[#F9F8F6] transition-colors mt-4"
              >
                Cancel
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#EAE5DB] text-center text-sm font-bold tracking-wide uppercase text-[#2D2D2A]">
              Have an account already?{' '}
              <button onClick={() => switchView('login')} className="underline hover:text-[#C57B57] ml-1">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
