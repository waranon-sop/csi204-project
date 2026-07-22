import { mockProducts } from '../data/products';

const PRODUCTS_KEY = 'products';
const ORDERS_KEY = 'orders';

export const initializeProducts = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PRODUCTS_KEY);
  let parsed = stored ? JSON.parse(stored) : [];

  if (parsed.length < mockProducts.length) {
    const existingIds = new Set(parsed.map(p => p.id));
    const newProducts = mockProducts
      .filter(p => !existingIds.has(p.id))
      .map(p => ({ ...p, status: 'Available', reservedAt: null }));
    
    parsed = [...parsed, ...newProducts];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(parsed));
  }
  return parsed;
};

export const getProducts = () => {
  if (typeof window === 'undefined') return [];
  return initializeProducts();
};

export const updateProductStatus = (productId, status) => {
  if (typeof window === 'undefined') return;
  const products = getProducts();
  const updated = products.map(p => {
    if (p.id === productId) {
      return { 
        ...p, 
        status, 
        reservedAt: status === 'Reserved' ? Date.now() : null 
      };
    }
    return p;
  });
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('productsUpdated'));
};

export const processOrderInventory = (cartItems) => {
  if (typeof window === 'undefined') return;
  const products = getProducts();
  
  const updated = products.map(p => {
    const itemInCart = cartItems.find(item => item.id === p.id);
    if (itemInCart) {
      if (p.stock !== undefined) {
         const newStock = Math.max(0, p.stock - (itemInCart.quantity || 1));
         return {
           ...p,
           stock: newStock,
           status: newStock === 0 ? 'Out of Stock' : p.status,
           reservedAt: null
         };
      } else {
         return { ...p, status: 'Sold Out', reservedAt: null };
      }
    }
    return p;
  });
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('productsUpdated'));
};

export const releaseExpiredReservations = () => {
  if (typeof window === 'undefined') return;
  const products = getProducts();
  const now = Date.now();
  let changed = false;

  const updated = products.map(p => {
    // 15 minutes = 15 * 60 * 1000 = 900,000 ms
    if (p.status === 'Reserved' && p.reservedAt && now - p.reservedAt > 900000) {
      changed = true;
      return { ...p, status: 'Available', reservedAt: null };
    }
    return p;
  });

  if (changed) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('productsUpdated'));
    return true; // indicates changes happened
  }
  return false;
};

export const createOrder = (orderData) => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(ORDERS_KEY);
  const orders = stored ? JSON.parse(stored) : [];
  
  const newOrder = {
    id: `RW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    status: 'Pending',
    ...orderData,
  };
  
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
};

export const getOrdersByUser = (userId) => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ORDERS_KEY);
  if (!stored) return [];
  const orders = JSON.parse(stored);
  return orders.filter(o => o.userId === userId);
};

export const getOrderById = (orderId) => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(ORDERS_KEY);
  if (!stored) return null;
  const orders = JSON.parse(stored);
  return orders.find(o => o.id === orderId) || null;
};

export const updateOrder = (orderId, updates) => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(ORDERS_KEY);
  if (!stored) return;
  const orders = JSON.parse(stored);
  const updatedOrders = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
};

export const updateUserById = (userId, updates) => {
  if (typeof window === 'undefined') return;
  const storedUsers = localStorage.getItem('users');
  if (!storedUsers) return;
  const users = JSON.parse(storedUsers);
  const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  // Sync to backend DB
  const updatedUser = updatedUsers.find(u => u.id === userId);
  if (updatedUser) {
    fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch(err => console.error('Failed to sync updated user by admin', err));
  }
};

const LOOKBOOKS_KEY = 'lookbooks';

export const getLookbooks = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOOKBOOKS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveLookbook = (lookbook) => {
  if (typeof window === 'undefined') return;
  const lookbooks = getLookbooks();
  
  if (lookbook.id && lookbooks.some(l => l.id === lookbook.id)) {
    const updated = lookbooks.map(l => l.id === lookbook.id ? lookbook : l);
    localStorage.setItem(LOOKBOOKS_KEY, JSON.stringify(updated));
  } else {
    lookbook.id = `look-${Date.now()}`;
    lookbooks.push(lookbook);
    localStorage.setItem(LOOKBOOKS_KEY, JSON.stringify(lookbooks));
  }
  window.dispatchEvent(new Event('lookbooksUpdated'));
};

export const deleteLookbook = (id) => {
  if (typeof window === 'undefined') return;
  const lookbooks = getLookbooks();
  const updated = lookbooks.filter(l => l.id !== id);
  localStorage.setItem(LOOKBOOKS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('lookbooksUpdated'));
};
