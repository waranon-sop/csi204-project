import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const getCookie = (name) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  return null;
};

const setCookie = (name, value, maxAge = 604800) => {
  if (typeof document !== 'undefined') {
    if (value) {
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");
  const [isRewardsOnboardingOpen, setIsRewardsOnboardingOpen] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const openAuthModal = (view = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openRewardsOnboarding = () => setIsRewardsOnboardingOpen(true);
  const closeRewardsOnboarding = () => setIsRewardsOnboardingOpen(false);

  const applyDailyReset = async (user) => {
    if (!user) return user;
    const today = new Date().toLocaleDateString('en-CA');
    if (user.lastMissionResetDate !== today) {
      user.completedMissions = (user.completedMissions || []).filter(m => !m.startsWith('daily-'));
      user.lastMissionResetDate = today;
      
      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (err) {
        console.error("Failed to reset daily missions", err);
      }
    }
    return user;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const userId = getCookie('userId');
      if (userId) {
        try {
          const res = await fetch('/api/users');
          if (res.ok) {
            const users = await res.json();
            const userInDB = users.find(u => u.id === userId);
            if (userInDB) {
              const resetUser = await applyDailyReset(userInDB);
              setCurrentUser(resetUser);
              setCookie('userRole', resetUser.role);
            } else {
              // User deleted or invalid
              setCookie('userId', null);
              setCookie('userRole', null);
            }
          }
        } catch (error) {
          console.error("Failed to initialize auth", error);
        }
      } else {
        setCookie('userRole', null);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password, keepSignedIn = false) => {
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        if (user.status === "suspended") {
          return { success: false, error: "This account has been suspended. Please contact an administrator." };
        }
        const resetUser = await applyDailyReset(user);
        setCurrentUser(resetUser);
        const maxAge = keepSignedIn ? 604800 : null; // Session cookie if not keep signed in
        if (keepSignedIn) {
          setCookie('userId', resetUser.id, 604800);
        } else {
          document.cookie = `userId=${resetUser.id}; path=/; SameSite=Lax`; // Session cookie
        }
        setCookie('userRole', resetUser.role);
        return { success: true, user: resetUser };
      }
      return { success: false, error: "Invalid email or password" };
    } catch (err) {
      return { success: false, error: "An error occurred during login" };
    }
  };

  const register = async (name, email, password, phone = "", keepSignedIn = false) => {
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      
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
      
      const referredBy = getCookie('referredBy') || null;

      const newUser = {
        id: newId,
        name,
        email,
        password,
        phone,
        role: "customer",
        referredBy,
        rank: null,
        isRewardsMember: false,
        tier: null,
        points: 0,
        couponsRedeemed: 0
      };

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      setCurrentUser(newUser);
      if (keepSignedIn) {
        setCookie('userId', newUser.id, 604800);
      } else {
        document.cookie = `userId=${newUser.id}; path=/; SameSite=Lax`;
      }
      setCookie('userRole', newUser.role);
      setPendingGoogleUser(null);
      setCookie('referredBy', null);

      return { success: true };
    } catch (err) {
      return { success: false, error: "Registration failed" };
    }
  };

  const loginWithGoogle = async (googleData) => {
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      const user = users.find((u) => u.email === googleData.email);

      if (!user) {
        setPendingGoogleUser(googleData);
        return { action: "register" };
      }

      const resetUser = await applyDailyReset(user);
      setCurrentUser(resetUser);
      setCookie('userId', resetUser.id);
      setCookie('userRole', resetUser.role);

      return { success: true };
    } catch (err) {
      return { success: false, error: "Google login failed" };
    }
  };

  const updateProfile = (updates) => {
    updateUser(updates);
  };

  const joinRewardsProgram = () => {
    updateProfile({ isRewardsMember: true, tier: 'Seed', points: 0, couponsRedeemed: 0 });
  };

  const addPoints = (amount) => {
    if (!currentUser) return;
    const newPoints = (currentUser.points || 0) + amount;
    updateProfile({ points: newPoints });
  };

  const deductPoints = (amount) => {
    if (!currentUser || (currentUser.points || 0) < amount) return false;
    updateProfile({ points: (currentUser.points || 0) - amount });
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCookie('userId', null);
    setCookie('userRole', null);
    window.dispatchEvent(new Event("userLoggedOut"));
  };

  const setDemoUser = (roleData) => {
    setCurrentUser(roleData);
    setCookie('userRole', roleData?.role || null);
    if (roleData) {
      setCookie('userId', roleData.id);
    } else {
      setCookie('userId', null);
    }
  };

  const addSpending = (amount) => {
    if (!currentUser || currentUser.role !== 'customer') return;
    const newSpending = (currentUser.total_spending || 0) + amount;
    if (currentUser.isRewardsMember) {
      const currentPoints = currentUser.points !== undefined ? currentUser.points : (currentUser.total_spending || 0);
      const newPoints = currentPoints + amount;
      let newTier = 'Seed';
      if (newSpending >= 25000) newTier = 'Harvest';
      else if (newSpending >= 12000) newTier = 'Fruit';
      else if (newSpending >= 6000) newTier = 'Bloom';
      else if (newSpending >= 2000) newTier = 'Sprout';
      updateUser({ total_spending: newSpending, tier: newTier, points: newPoints });
    } else {
      updateUser({ total_spending: newSpending });
    }
  };

  const claimMission = (missionId, points) => {
    if (!currentUser) return;
    const completedMissions = currentUser.completedMissions || [];
    if (completedMissions.includes(missionId)) return;
    const currentPoints = currentUser.points !== undefined ? currentUser.points : (currentUser.total_spending || 0);
    const newPoints = currentPoints + points;
    const newCompleted = [...completedMissions, missionId];
    updateUser({ points: newPoints, completedMissions: newCompleted });
  };

  const redeemReward = (reward) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const currentPoints = currentUser.points !== undefined ? currentUser.points : (currentUser.total_spending || 0);
    if (currentPoints < reward.pointsRequired) {
      return { success: false, error: 'Not enough points' };
    }

    const isDiscount = reward.title.includes('Discount');
    const currentYear = new Date().getFullYear();
    let redeemedDiscountsThisYear = currentUser.redeemedDiscountsThisYear || {};
    
    if (isDiscount) {
      let yearData = redeemedDiscountsThisYear[currentYear];
      if (typeof yearData === 'number') {
        yearData = { 'Legacy Discount': yearData };
      } else if (!yearData) {
        yearData = {};
      }
      const countForThisReward = yearData[reward.title] || 0;
      const limit = reward.limit || 5;
      
      if (countForThisReward >= limit) {
        return { success: false, error: `Yearly limit reached (${limit}/${limit})` };
      }
      redeemedDiscountsThisYear = {
        ...redeemedDiscountsThisYear,
        [currentYear]: {
          ...yearData,
          [reward.title]: countForThisReward + 1
        }
      };
    }

    const newPoints = currentPoints - reward.pointsRequired;
    const newCoupon = {
      id: `CPN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: `RW-${reward.title.substring(0, 4).toUpperCase().replace(/[% ]/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      title: reward.title,
      type: isDiscount ? 'discount' : reward.title.includes('Standard') ? 'free_standard' : reward.title.includes('Express') ? 'free_express' : 'other',
      dateRedeemed: new Date().toISOString(),
      status: 'active'
    };

    const currentCoupons = currentUser.coupons || [];
    updateUser({ 
      points: newPoints, 
      redeemedDiscountsThisYear,
      coupons: [newCoupon, ...currentCoupons]
    });

    return { success: true, coupon: newCoupon };
  };

  const updateUser = async (updates) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, ...updates };

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
    redeemReward,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
