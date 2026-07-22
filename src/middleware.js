import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Read the userRole cookie
  const userRole = request.cookies.get('userRole')?.value;

  // 1. Admin Dashboard Route Protection
  if (pathname === '/admin' || pathname === '/admin/') {
    if (userRole === 'staff') {
      return NextResponse.redirect(new URL('/admin/inventory', request.url));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. General Admin Routes (Inventory, Orders, Promotions, Users, Settings)
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin' && userRole !== 'staff') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Customer Routes
  const customerRoutes = ['/profile', '/orders', '/wardrobe', '/eco-impact'];
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route));

  if (isCustomerRoute) {
    // Admins and Staff shouldn't access customer routes directly, send them to their dashboard
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (userRole === 'staff') {
      return NextResponse.redirect(new URL('/admin/inventory', request.url));
    }
    // Unauthenticated users trying to access protected customer routes
    if (!userRole) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Specify the paths that the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wardrobe/:path*',
    '/eco-impact/:path*'
  ],
};
