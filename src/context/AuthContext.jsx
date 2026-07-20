import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
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

  // Initialize from localStorage and sessionStorage
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

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
    localStorage.setItem("users", JSON.stringify(storedUsers));

    // Seed initial admin if not exists
    if (
      !storedUsers.find((u) => u.id === "ADM-0001" || u.id === "seed-admin-001")
    ) {
      const seedAdmin = {
        id: "ADM-0001",
        name: "ยิ่งยศ ผู้ดูแลระบบ",
        email: "admin@rewear.com",
        password: "admin",
        role: "admin",
      };
      storedUsers = [seedAdmin, ...storedUsers];
      localStorage.setItem("users", JSON.stringify(storedUsers));
    } else {
      // Migrate old email 'admin' -> 'admin@rewear.com' and old ID 'seed-admin-001' -> 'ADM-0001'
      storedUsers = storedUsers.map((u) => {
        if (u.id === "seed-admin-001" || u.id === "ADM-0001") {
          return {
            ...u,
            id: "ADM-0001",
            email: u.email === "admin" ? "admin@rewear.com" : u.email,
          };
        }
        return u;
      });
      localStorage.setItem("users", JSON.stringify(storedUsers));
    }

    // Seed initial staff if not exists
    if (
      !storedUsers.find((u) => u.id === "STF-0001" || u.id === "seed-staff-001")
    ) {
      const seedStaff = {
        id: "STF-0001",
        name: "สมหญิง พนักงาน",
        email: "staff@rewear.com",
        password: "staff",
        role: "staff",
      };
      storedUsers = [seedStaff, ...storedUsers];
      localStorage.setItem("users", JSON.stringify(storedUsers));
    } else {
      // Migrate old email 'staff' -> 'staff@rewear.com' and old ID 'seed-staff-001' -> 'STF-0001'
      storedUsers = storedUsers.map((u) => {
        if (u.id === "seed-staff-001" || u.id === "STF-0001") {
          return {
            ...u,
            id: "STF-0001",
            email: u.email === "staff" ? "staff@rewear.com" : u.email,
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
      if (storedSession.id === "seed-admin-001") storedSession.id = "ADM-0001";
      if (storedSession.id === "seed-staff-001") storedSession.id = "STF-0001";
      if (sessionStorage.getItem("currentUser"))
        sessionStorage.setItem("currentUser", JSON.stringify(storedSession));
      if (localStorage.getItem("currentUser"))
        localStorage.setItem("currentUser", JSON.stringify(storedSession));
    }

    setUsers(storedUsers);
    setCurrentUser(storedSession);
  }, []);

  const login = (email, password, keepSignedIn = false) => {
    const currentUsers = JSON.parse(localStorage.getItem("users")) || users;
    const user = currentUsers.find(
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

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      phone,
      role: "customer", // Default role
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Auto-login after register
    setCurrentUser(newUser);
    if (keepSignedIn) {
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      sessionStorage.removeItem("currentUser");
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(newUser));
      localStorage.removeItem("currentUser");
    }

    setPendingGoogleUser(null); // Clear any pending data

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

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
  };

  // For the SAD System Design demo widget
  const setDemoUser = (roleData) => {
    setCurrentUser(roleData);
  };

  const updateUser = (updatedData) => {
    if (!currentUser) return;
    const newUser = { ...currentUser, ...updatedData };
    setCurrentUser(newUser);

    // Update users array
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = storedUsers.map((u) =>
      u.id === currentUser.id ? { ...u, ...updatedData } : u,
    );
    setUsers(updatedUsers);
    try {
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Update currentUser in storage
      if (sessionStorage.getItem("currentUser")) {
        sessionStorage.setItem("currentUser", JSON.stringify(newUser));
      }
      if (localStorage.getItem("currentUser")) {
        localStorage.setItem("currentUser", JSON.stringify(newUser));
      }
    } catch (error) {
      console.warn(
        "Storage Quota Exceeded! Attempting to free up space by stripping avatars from other users...",
      );
      try {
        // Fallback: Remove avatars from other users to free up LocalStorage space
        const strippedUsers = updatedUsers.map((u) =>
          u.id === currentUser.id ? u : { ...u, avatar: null },
        );
        localStorage.setItem("users", JSON.stringify(strippedUsers));
        setUsers(strippedUsers);

        if (sessionStorage.getItem("currentUser"))
          sessionStorage.setItem("currentUser", JSON.stringify(newUser));
        if (localStorage.getItem("currentUser"))
          localStorage.setItem("currentUser", JSON.stringify(newUser));
      } catch (innerError) {
        console.error(
          "Still exceeding quota after stripping avatars.",
          innerError,
        );
        alert(
          "พื้นที่เก็บข้อมูลในเบราว์เซอร์เต็ม (Storage Full) ไม่สามารถบันทึกข้อมูลรูปภาพขนาดใหญ่ได้ กรุณาใช้ไฟล์รูปที่เล็กลงหรือล้างข้อมูลเบราว์เซอร์",
        );
      }
    }
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
    isAuthModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
