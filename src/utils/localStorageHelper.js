// This file has been refactored to use the backend API (/api/*) instead of localStorage for Core Data.
// It retains its original name for backward compatibility with imports.

export const getProducts = async () => {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch products", e);
    return [];
  }
};

export const updateProductStatus = async (productId, status) => {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reservedAt: status === 'Reserved' ? Date.now() : null })
    });
    window.dispatchEvent(new Event('productsUpdated'));
  } catch (e) {
    console.error("Failed to update product status", e);
  }
};

export const processOrderInventory = async (cartItems) => {
  if (typeof window === 'undefined' || !cartItems || !cartItems.length) return;
  try {
    // We update each item in the cart to be 'Sold Out' or deduct stock
    const products = await getProducts();
    for (const item of cartItems) {
      const p = products.find(prod => prod.id === item.id);
      if (p) {
        if (p.stock !== undefined) {
          const newStock = Math.max(0, p.stock - (item.quantity || 1));
          await fetch(`/api/products/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock, status: newStock === 0 ? 'Out of Stock' : p.status, reservedAt: null })
          });
        } else {
          await fetch(`/api/products/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Sold Out', reservedAt: null })
          });
        }
      }
    }
    window.dispatchEvent(new Event('productsUpdated'));
  } catch (e) {
    console.error("Failed to process inventory", e);
  }
};

export const releaseExpiredReservations = async () => {
  if (typeof window === 'undefined') return false;
  try {
    const products = await getProducts();
    const now = Date.now();
    let changed = false;

    for (const p of products) {
      if (p.status === 'Reserved' && p.reservedAt && now - p.reservedAt > 900000) { // 15 mins
        await fetch(`/api/products/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Available', reservedAt: null })
        });
        changed = true;
      }
    }

    if (changed) {
      window.dispatchEvent(new Event('productsUpdated'));
    }
    return changed;
  } catch (e) {
    console.error("Failed to release reservations", e);
    return false;
  }
};

export const createOrder = async (orderData) => {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to create order", e);
    return null;
  }
};

export const getOrdersByUser = async (userId) => {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const orders = await res.json();
    return orders.filter(o => o.userId === userId);
  } catch (e) {
    console.error("Failed to fetch user orders", e);
    return [];
  }
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
