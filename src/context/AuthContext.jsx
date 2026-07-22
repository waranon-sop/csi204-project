import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Helper to sync role to cookies for middleware
  const setRoleCookie = (role) => {
    if (typeof document !== 'undefined') {
      if (role) {
        document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        document.cookie = `userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
  };
  const [users, setUsers] = useState([]);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");

  // Pending Google Data
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const openAuthModal = (view = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Initialize from API with fallback to localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      let storedUsers = [];
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          storedUsers = await res.json();
          // Update localStorage to keep it in sync
          localStorage.setItem("users", JSON.stringify(storedUsers));
        } else {
          throw new Error("Failed to fetch from API");
        }
      } catch (error) {
        console.warn("Could not fetch users from API, falling back to localStorage", error);
        storedUsers = JSON.parse(localStorage.getItem("users")) || [];
      }

      // Auto-clean up duplicate users (fix for the old seed bug)
      const uniqueUsers = new Map();
      storedUsers.forEach((u) => {
        if (uniqueUsers.has(u.id)) {
          // Prefer the customized one over the default seed
          if (u.email !== "staff" && u.email !== "admin") {
            uniqueUsers.set(u.id, u);
          }
        } else {
          uniqueUsers.set(u.id, u);
        }
      });
      storedUsers = Array.from(uniqueUsers.values());

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

      localStorage.setItem("users", JSON.stringify(storedUsers));

      // Seed initial admin if not exists
      if (
        !storedUsers.find((u) => u.id === "U-001" || u.id === "ADM-0001" || u.id === "seed-admin-001")
      ) {
        const seedAdmin = {
          id: "U-001",
          name: "ยิ่งยศ ผู้ดูแลระบบ",
          email: "admin@rewear.com",
          password: "admin",
          role: "admin",
        };
        storedUsers = [seedAdmin, ...storedUsers];
        localStorage.setItem("users", JSON.stringify(storedUsers));
      } else {
        // Migrate old email 'admin' -> 'admin@rewear.com' and old IDs to 'U-001'
        storedUsers = storedUsers.map((u) => {
          if (u.id === "seed-admin-001" || u.id === "ADM-0001" || u.id === "U-001") {
            return {
              ...u,
              id: "U-001",
              email: (u.email === "admin" || !u.email) ? "admin@rewear.com" : u.email,
              role: "admin", // Ensure role is always admin
            };
          }
          return u;
        });
        localStorage.setItem("users", JSON.stringify(storedUsers));
      }

      // Seed initial staff if not exists
      if (
        !storedUsers.find((u) => u.id === "U-002" || u.id === "STF-0001" || u.id === "seed-staff-001")
      ) {
        const seedStaff = {
          id: "U-002",
          name: "สมหญิง พนักงาน",
          email: "staff@rewear.com",
          password: "staff",
          role: "staff",
        };
        storedUsers = [seedStaff, ...storedUsers];
        localStorage.setItem("users", JSON.stringify(storedUsers));
      } else {
        // Migrate old email 'staff' -> 'staff@rewear.com' and old IDs to 'U-002'
        storedUsers = storedUsers.map((u) => {
          if (u.id === "seed-staff-001" || u.id === "STF-0001" || u.id === "U-002") {
            return {
              ...u,
              id: "U-002",
              email: (u.email === "staff" || !u.email) ? "staff@rewear.com" : u.email,
            };
          }
          return u;
        });
        localStorage.setItem("users", JSON.stringify(storedUsers));
      }

      let storedSession =
        JSON.parse(sessionStorage.getItem("currentUser")) ||
        JSON.parse(localStorage.getItem("currentUser")) ||
        null;

      // Migrate active session ID if needed
      if (storedSession) {
        if (storedSession.id === "seed-admin-001" || storedSession.id === "ADM-0001") storedSession.id = "U-001";
        if (storedSession.id === "seed-staff-001" || storedSession.id === "STF-0001") storedSession.id = "U-002";
        
        if (storedSession.rank === 'Monstrosa') storedSession.rank = 'Harvest';
        if (storedSession.rank === 'Variegata') storedSession.rank = 'Fruit';

        // Ensure session user still exists and update data
        const currentUserInDB = storedUsers.find(u => u.id === storedSession.id);
        if (currentUserInDB) {
          storedSession = currentUserInDB;
          if (sessionStorage.getItem("currentUser"))
            sessionStorage.setItem("currentUser", JSON.stringify(storedSession));
          if (localStorage.getItem("currentUser"))
            localStorage.setItem("currentUser", JSON.stringify(storedSession));
          setRoleCookie(storedSession.role);
        } else {
          storedSession = null;
          sessionStorage.removeItem("currentUser");
          localStorage.removeItem("currentUser");
          setRoleCookie(null);
        }
      } else {
        setRoleCookie(null);
      }

      setUsers(storedUsers);
      setCurrentUser(storedSession);
    };

    initializeAuth();
  }, []);

  const login = (email, password, keepSignedIn = false) => {
    const freshUsers = JSON.parse(localStorage.getItem("users")) || users;
    const user = freshUsers.find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      if (user.status === "suspended") {
        return {
          success: false,
          error:
            "This account has been suspended. Please contact an administrator.",
        };
      }
      setCurrentUser(user);
      if (keepSignedIn) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        sessionStorage.removeItem("currentUser");
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.removeItem("currentUser");
      }
      setRoleCookie(user.role);
      // Sync users state with the fresh data
      setUsers(freshUsers);
      return { success: true, user };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const register = (
    name,
    email,
    password,
    phone = "",
    keepSignedIn = false,
  ) => {
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email already exists" };
    }

    const maxUId = users.reduce((max, u) => {
      if (u.id && u.id.startsWith("U-")) {
        const num = parseInt(u.id.replace("U-", ""), 10);
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);
    const newId = `U-${String(maxUId + 1).padStart(3, "0")}`;
    const referredBy = localStorage.getItem('referredBy');

    const newUser = {
      id: newId,
      name,
      email,
      password,
      phone,
      role: "customer", // Default role
      referredBy: referredBy || null,
      rank: 'Seed'
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Sync to backend DB
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).catch(err => console.error('Failed to sync new user to DB', err));

    // Auto-login after register
    setCurrentUser(newUser);
    if (keepSignedIn) {
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      sessionStorage.removeItem("currentUser");
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(newUser));
      localStorage.removeItem("currentUser");
    }
    setRoleCookie(newUser.role);

    setPendingGoogleUser(null); // Clear any pending data
    localStorage.removeItem('referredBy');

    return { success: true };
  };

  const loginWithGoogle = (googleData) => {
    // googleData contains email and name from decoded JWT
    let user = users.find((u) => u.email === googleData.email);

    if (!user) {
      // First time user: save data and require registration
      setPendingGoogleUser(googleData);
      return { action: "register" };
    }

    // Existing user: Login automatically
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    sessionStorage.removeItem("currentUser");
    setRoleCookie(user.role);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    setRoleCookie(null);
  };

  // For the SAD System Design demo widget
  const setDemoUser = (roleData) => {
    setCurrentUser(roleData);
    setRoleCookie(roleData?.role || null);
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
        
        try {
          localStorage.setItem('users', JSON.stringify(updatedUsersList));
        } catch (error) {
          console.warn("Storage Quota Exceeded! Attempting to free up space by stripping avatars from other users...");
          try {
            // Fallback: Remove avatars from other users to free up LocalStorage space
            const strippedUsers = updatedUsersList.map(u => 
              u.id === updatedUser.id ? u : { ...u, avatar: null }
            );
            localStorage.setItem("users", JSON.stringify(strippedUsers));
            return strippedUsers;
          } catch (innerError) {
            console.error("Still exceeding quota after stripping avatars.", innerError);
            alert("พื้นที่เก็บข้อมูลในเบราว์เซอร์เต็ม (Storage Full) ไม่สามารถบันทึกข้อมูลรูปภาพขนาดใหญ่ได้ กรุณาใช้ไฟล์รูปที่เล็กลงหรือล้างข้อมูลเบราว์เซอร์");
          }
        }
        
        return updatedUsersList;
      });

      if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('currentUser')) {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Sync to backend DB
      fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(err => console.error('Failed to sync updated user to DB', err));

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
    updateUser,
    addSpending,
    claimMission,
    isAuthModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
