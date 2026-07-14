import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Initialize from localStorage
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

    const storedSession = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    setUsers(storedUsers);
    setCurrentUser(storedSession);
  }, []);

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password) => {
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: 'customer' // Default role
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Auto-login after register
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
