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

export const getOrderById = async (orderId) => {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const orders = await res.json();
    return orders.find(o => o.id === orderId) || null;
  } catch (e) {
    console.error("Failed to fetch order", e);
    return null;
  }
};

export const updateOrder = async (orderId, updates) => {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (e) {
    console.error("Failed to update order", e);
  }
};

export const updateUserById = async (userId, updates) => {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    // Also update local storage to keep client in sync before a full reload
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = localUsers.map(u => u.id === userId ? { ...u, ...updates } : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

  } catch (err) {
    console.error('Failed to sync updated user', err);
  }
};

export const getLookbooks = async () => {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/api/lookbooks');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch lookbooks", e);
    return [];
  }
};

export const saveLookbook = async (lookbook) => {
  if (typeof window === 'undefined') return;
  try {
    const isUpdate = Boolean(lookbook.id);
    const url = isUpdate ? `/api/lookbooks/${lookbook.id}` : '/api/lookbooks';
    const method = isUpdate ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lookbook)
    });
    window.dispatchEvent(new Event('lookbooksUpdated'));
  } catch (e) {
    console.error("Failed to save lookbook", e);
  }
};

export const deleteLookbook = async (id) => {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/lookbooks/${id}`, { method: 'DELETE' });
    window.dispatchEvent(new Event('lookbooksUpdated'));
  } catch (e) {
    console.error("Failed to delete lookbook", e);
  }
};
