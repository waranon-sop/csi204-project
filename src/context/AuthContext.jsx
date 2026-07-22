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
  
  // Rewards Onboarding State
  const [isRewardsOnboardingOpen, setIsRewardsOnboardingOpen] = useState(false);

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openRewardsOnboarding = () => {
    setIsRewardsOnboardingOpen(true);
  };

  const closeRewardsOnboarding = () => {
    setIsRewardsOnboardingOpen(false);
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
      role: 'customer', // Default role
      isRewardsMember: true,
      tier: 'Seed',
      points: 0,
      couponsRedeemed: 0
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
        role: 'customer',
        isRewardsMember: true,
        tier: 'Seed',
        points: 0,
        couponsRedeemed: 0
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

  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('currentUser')) {
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const joinRewardsProgram = () => {
    updateProfile({ isRewardsMember: true, tier: 'Seed', points: 0, couponsRedeemed: 0 });
  };

  const addPoints = (amount) => {
    if (!currentUser) return;
    const newPoints = (currentUser.points || 0) + amount;
    // Calculate new tier
    let newTier = currentUser.tier || 'Seed';
    if (newPoints >= 2000) newTier = 'Harvest';
    else if (newPoints >= 1000) newTier = 'Fruit';
    else if (newPoints >= 500) newTier = 'Bloom';
    else if (newPoints >= 200) newTier = 'Sprout';
    
    updateProfile({ points: newPoints, tier: newTier });
  };

  const deductPoints = (amount) => {
    if (!currentUser || (currentUser.points || 0) < amount) return false;
    updateProfile({ points: (currentUser.points || 0) - amount });
    return true;
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
    closeAuthModal,
    isRewardsOnboardingOpen,
    openRewardsOnboarding,
    closeRewardsOnboarding,
    updateProfile,
    joinRewardsProgram,
    addPoints,
    deductPoints
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
