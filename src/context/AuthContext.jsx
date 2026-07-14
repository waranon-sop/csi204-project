import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Initialize from localStorage and sessionStorage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const storedSession = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser')) || null;
    
    setUsers(storedUsers);
    setCurrentUser(storedSession);
  }, []);

  const login = (email, password, keepSignedIn = false) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (keepSignedIn) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.removeItem('currentUser');
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem('currentUser');
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password, phone = '', keepSignedIn = false) => {
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      phone,
      role: 'customer' // Default role
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Auto-login after register
    setCurrentUser(newUser);
    if (keepSignedIn) {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      sessionStorage.removeItem('currentUser');
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.removeItem('currentUser');
    }

    return { success: true };
  };

  const loginWithGoogle = () => {
    // Simulated Google Login payload
    const mockGoogleProfile = {
      email: 'user.demo@gmail.com',
      name: 'Google User',
    };

    let user = users.find(u => u.email === mockGoogleProfile.email);
    
    // If user doesn't exist, register them silently (mocking Google auto-registration)
    if (!user) {
      user = {
        id: Date.now().toString(),
        name: mockGoogleProfile.name,
        email: mockGoogleProfile.email,
        password: '', // Google users don't need a password in this flow
        phone: '',
        role: 'customer'
      };
      
      const updatedUsers = [...users, user];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    // Perform Login
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.removeItem('currentUser');
    
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  };

  // For the SAD System Design demo widget
  const setDemoUser = (roleData) => {
    setCurrentUser(roleData);
  };

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    setDemoUser,
    isAuthModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
