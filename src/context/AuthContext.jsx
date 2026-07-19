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
  
  // Pending Google Data
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Initialize from localStorage and sessionStorage
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    
    // Seed initial admin if not exists
    if (!storedUsers.find(u => u.email === 'admin')) {
      const seedAdmin = {
        id: 'seed-admin-001',
        name: 'ยิ่งยศ ผู้ดูแลระบบ',
        email: 'admin', 
        password: 'admin',
        role: 'admin'
      };
      storedUsers = [seedAdmin, ...storedUsers];
      localStorage.setItem('users', JSON.stringify(storedUsers));
    }

    // Seed initial staff if not exists
    if (!storedUsers.find(u => u.email === 'staff')) {
      const seedStaff = {
        id: 'seed-staff-001',
        name: 'สมหญิง พนักงาน',
        email: 'staff', 
        password: 'staff',
        role: 'staff'
      };
      storedUsers = [seedStaff, ...storedUsers];
      localStorage.setItem('users', JSON.stringify(storedUsers));
    }

    const storedSession = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser')) || null;
    
    setUsers(storedUsers);
    setCurrentUser(storedSession);
  }, []);

  const login = (email, password, keepSignedIn = false) => {
    const currentUsers = JSON.parse(localStorage.getItem('users')) || users;
    const user = currentUsers.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status === 'suspended') {
        return { success: false, error: 'This account has been suspended. Please contact an administrator.' };
      }
      setCurrentUser(user);
      if (keepSignedIn) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.removeItem('currentUser');
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem('currentUser');
      }
      return { success: true, user };
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

    setPendingGoogleUser(null); // Clear any pending data

    return { success: true };
  };

  const loginWithGoogle = (googleData) => {
    // googleData contains email and name from decoded JWT
    let user = users.find(u => u.email === googleData.email);
    
    if (!user) {
      // First time user: save data and require registration
      setPendingGoogleUser(googleData);
      return { action: 'register' };
    }

    // Existing user: Login automatically
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
    pendingGoogleUser,
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
