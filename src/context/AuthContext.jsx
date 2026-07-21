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
    let ranksUpdated = false;

    // Migrate old ranks for users
    storedUsers = storedUsers.map(u => {
      if (u.rank === 'Monstrosa') {
        ranksUpdated = true;
        return { ...u, rank: 'Harvest' };
      }
      if (u.rank === 'Variegata') {
        ranksUpdated = true;
        return { ...u, rank: 'Fruit' };
      }
      return u;
    });

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
      ranksUpdated = true;
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
      ranksUpdated = true;
    }

    if (ranksUpdated) {
      localStorage.setItem('users', JSON.stringify(storedUsers));
    }

    let storedSession = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser')) || null;

    if (storedSession) {
      if (storedSession.rank === 'Monstrosa') storedSession.rank = 'Harvest';
      if (storedSession.rank === 'Variegata') storedSession.rank = 'Fruit';

      if (sessionStorage.getItem('currentUser')) sessionStorage.setItem('currentUser', JSON.stringify(storedSession));
      if (localStorage.getItem('currentUser')) localStorage.setItem('currentUser', JSON.stringify(storedSession));
    }

    setUsers(storedUsers);
    setCurrentUser(storedSession);
  }, []);

  const login = (email, password, keepSignedIn = false) => {
    // Fetch fresh from localStorage to avoid stale state in SPA
    const freshUsers = JSON.parse(localStorage.getItem('users')) || users;
    const user = freshUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (keepSignedIn) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.removeItem('currentUser');
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem('currentUser');
      }
      // Sync users state with the fresh data
      setUsers(freshUsers);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password, phone = '', keepSignedIn = false) => {
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const referredBy = localStorage.getItem('referredBy');

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      phone,
      referredBy: referredBy || null,
      role: 'customer', // Default role
      rank: 'Seed'
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
    localStorage.removeItem('referredBy');

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

  const addSpending = (amount) => {
    if (!currentUser || currentUser.role !== 'customer') return;

    const newSpending = (currentUser.total_spending || 0) + amount;

    let newRank = 'Seed';
    if (newSpending >= 25000) newRank = 'Harvest';
    else if (newSpending >= 12000) newRank = 'Fruit';
    else if (newSpending >= 6000) newRank = 'Bloom';
    else if (newSpending >= 2000) newRank = 'Sprout';

    const currentPoints = currentUser.points !== undefined ? currentUser.points : (currentUser.total_spending || 0);
    const newPoints = currentPoints + amount;

    updateUser({ total_spending: newSpending, rank: newRank, points: newPoints });
  };

  const claimMission = (missionId, points) => {
    if (!currentUser) return;

    const completedMissions = currentUser.completedMissions || [];
    if (completedMissions.includes(missionId)) return; // Already claimed

    // Initialize points to total_spending if it's the first time
    const currentPoints = currentUser.points !== undefined ? currentUser.points : (currentUser.total_spending || 0);
    const newPoints = currentPoints + points;
    const newCompleted = [...completedMissions, missionId];

    updateUser({ points: newPoints, completedMissions: newCompleted });
  };


  const updateUser = (updates) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, ...updates };

      setUsers(prevUsers => {
        // Fetch fresh users from localStorage to avoid overwriting changes made by other functions (like updateUserById)
        const currentUsers = JSON.parse(localStorage.getItem('users')) || prevUsers;
        const updatedUsersList = currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('users', JSON.stringify(updatedUsersList));
        return updatedUsersList;
      });

      if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('currentUser')) {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      return updatedUser;
    });
  };

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    pendingGoogleUser,
    logout,
    setDemoUser,
    addSpending,
    updateUser,
    claimMission,
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
