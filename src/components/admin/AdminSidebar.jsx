"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  HelpCircle,
  Store,
  Tag,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { settings, isLoadingSettings } = useSettings();

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname?.startsWith(path);
  };

  return (
    <aside className="w-56 h-screen flex flex-col fixed left-0 top-0 bg-[#F5F2ED] border-r border-[#D8D2C8] shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 text-[#2D2D2A]">
      {/* Brand */}
      <div className="pt-8 px-6 pb-6">
        <p className="text-xl font-serif text-[#2D2D2A] mb-1">Admin Portal</p>
        <p className={`text-xs font-semibold text-[#8B8B88] transition-opacity duration-300 ${isLoadingSettings ? 'opacity-0' : 'opacity-100'}`}>
          {settings.storeName || "Re-wear System"}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {[
          {
            name: "Dashboard",
            path: "/admin",
            icon: LayoutDashboard,
            adminOnly: true,
          },
          { name: "Inventory", path: "/admin/inventory", icon: Package },
          { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
          { name: "Promotions", path: "/admin/promotions", icon: Tag, adminOnly: true },
          { name: "Users", path: "/admin/users", icon: Users, adminOnly: true },
          { name: "Support Config", path: "/admin/support", icon: HelpCircle, adminOnly: true },
        ]
          .filter((item) => !item.adminOnly || currentUser?.role === "admin")
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-none transition-all duration-200 text-sm font-semibold ${
                  active
                    ? "bg-[#E3E7D3] text-[#2D2D2A] border-l-4 border-[#3A4A2D] -ml-3 pl-6"
                    : "text-[#5C5C58] hover:bg-[#EAE5DB]/50 border-l-4 border-transparent -ml-3 pl-6 hover:text-[#2D2D2A]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
      </nav>


    </aside>
  );
}
