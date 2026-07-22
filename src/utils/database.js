import { mockProducts } from '../data/products';

// กำหนดชื่อ Key (Table) ทั้งหมดที่จะใช้ใน Local Storage
const DB_KEYS = {
  USERS: 're_wear_users',
  PRODUCTS: 'products', // ใช้ products เดิมเพื่อให้เข้ากันได้กับ localStorageHelper
  ORDERS: 'orders',     // ใช้ orders เดิม
  CART: 're_wear_cart'
};

// ==========================================
// Core Database Engine Functions
// ฟังก์ชันพื้นฐานสำหรับอ่าน/เขียนข้อมูลลง Local Storage
// ==========================================
const readDB = (key) => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const writeDB = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// 1. Product Database (สินค้า) - สำหรับหน้าร้าน และจัดการสต๊อก
// ==========================================
export const ProductDB = {
  // เริ่มต้นสร้างข้อมูลสินค้าจำลองครั้งแรก ถ้าฐานข้อมูลยังว่างเปล่า
  init: () => {
    let products = readDB(DB_KEYS.PRODUCTS);
    
    // Force clear all products once because user requested a completely clean slate
    // (User confirmed they never added any products, so everything currently there is old mock data)
    if (typeof window !== 'undefined' && !localStorage.getItem('re_wear_force_cleared_v2')) {
      localStorage.removeItem(DB_KEYS.PRODUCTS);
      localStorage.setItem('re_wear_force_cleared_v2', 'true');
      products = [];
      writeDB(DB_KEYS.PRODUCTS, products);
    }
    
    // Actively remove all old mock products if they exist in localStorage
    const mockIds = ['P01', 'P02', 'P03', 'P04', 'P05', 'RW-29402', 'RW-18239', 'RW-99201', 'RW-00451'];
    const filteredProducts = products.filter(p => !mockIds.includes(p.id));
    if (filteredProducts.length !== products.length) {
      products = filteredProducts;
      writeDB(DB_KEYS.PRODUCTS, products);
    }
    
    return products;
  },

  // ดึงรายการสินค้าทั้งหมดไปโชว์ที่หน้าร้าน
  getAll: () => {
    return ProductDB.init();
  },

  // อ่านข้อมูลสินค้า 1 ชิ้น (เช่น กดเข้าไปดูรายละเอียด)
  getById: (id) => {
    const products = ProductDB.getAll();
    return products.find(p => p.id === id);
  },

  // ----------------------------------------------------
  // สำหรับหน้า Admin (ฝากให้เพื่อนคุณเอาไปเรียกใช้ได้เลยครับ)
  // ----------------------------------------------------
  
  // เพิ่มสินค้าใหม่
  add: (newProduct) => {
    const products = ProductDB.getAll();
    products.push(newProduct);
    writeDB(DB_KEYS.PRODUCTS, products);
  },

  // อัปเดตข้อมูลสินค้า (เช่น แก้ราคา หรือ เปลี่ยนสถานะเป็น Reserved/Sold Out)
  update: (id, updates) => {
    const products = ProductDB.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      writeDB(DB_KEYS.PRODUCTS, products);
      window.dispatchEvent(new Event('productsUpdated'));
    }
  },

  // จัดเก็บสินค้า (Archive) แทนการลบทิ้ง เพื่อเก็บประวัติไว้
  archive: (id) => {
    const products = ProductDB.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], status: 'Archived' };
      writeDB(DB_KEYS.PRODUCTS, products);
      window.dispatchEvent(new Event('productsUpdated'));
    }
  }
};

// ==========================================
// 2. Order Database (คำสั่งซื้อ) - สำหรับเก็บประวัติการสั่ง
// ==========================================
export const OrderDB = {
  getAll: () => readDB(DB_KEYS.ORDERS),
  
  create: (orderData) => {
    const orders = readDB(DB_KEYS.ORDERS);
    const newOrder = {
      id: `RW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      status: 'Pending',
      ...orderData,
    };
    orders.push(newOrder);
    writeDB(DB_KEYS.ORDERS, orders);
    return newOrder;
  },

  getByUserId: (userId) => {
    const orders = readDB(DB_KEYS.ORDERS);
    return orders.filter(o => o.userId === userId);
  }
};

// ==========================================
// 3. Cart Database (ตะกร้าสินค้า) - สำหรับหน้าร้าน
// ==========================================
export const CartDB = {
  // ดึงตะกร้าของ User
  getByUserId: (userId) => {
    const carts = readDB(DB_KEYS.CART);
    const userCart = carts.find(c => c.userId === userId);
    return userCart ? userCart : { userId, items: [] };
  },

  // อัปเดตตะกร้าของ User (เพิ่ม/ลบ items)
  saveCart: (userId, items) => {
    const carts = readDB(DB_KEYS.CART);
    const index = carts.findIndex(c => c.userId === userId);
    if (index !== -1) {
      carts[index].items = items;
    } else {
      carts.push({ userId, items });
    }
    writeDB(DB_KEYS.CART, carts);
  }
};
