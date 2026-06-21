/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, ShieldAlert, Laptop } from 'lucide-react';
import { DanhMuc } from '../types';

interface HeaderProps {
  categories: DanhMuc[];
  activeCategory: string; // 'all' | 'iphone' | 'ipad'
  setActiveCategory: (cat: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  currentUser: { TenKhachHang?: string; Email?: string; HoTen?: string; TenDangNhap?: string } | null;
  currentRole: 'customer' | 'admin' | null;
  onLogout: () => void;
  onOpenAdmin: () => void;
  isAdminOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  categories,
  activeCategory,
  setActiveCategory,
  cartCount,
  onOpenCart,
  onOpenAuth,
  currentUser,
  currentRole,
  onLogout,
  onOpenAdmin,
  isAdminOpen,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-[#003366] border-b border-blue-900/40 text-white sticky top-0 z-50 transition-all duration-300 shadow-md" id="ducstore-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2.5 cursor-pointer group" 
              onClick={() => { setActiveCategory('all'); if (isAdminOpen) onOpenAdmin(); }}
              id="ducstore-logo-container"
            >
              {/* Silver Apple logo look */}
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
                <Laptop className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  DucStore
                </span>
                <p className="text-[8px] text-white/50 tracking-wider uppercase font-mono">Premium Hub</p>
              </div>
            </div>
            
            {/* Quick Cart count on Mobile */}
            <div className="flex items-center space-x-2 md:hidden">
              <button 
                onClick={onOpenCart} 
                className="relative p-2 text-white/80 hover:text-white"
                id="cart-btn-mobile"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Rounded Menu Navigation - Strictly styled as clean light sleek tabs */}
          <nav className="flex items-center justify-center" id="ducstore-nav">
            <div className="bg-white p-1 rounded-full border border-gray-200/80 shadow-sm flex items-center gap-1 sm:gap-1.5">
              <button
                id="nav-all-btn"
                onClick={() => { setActiveCategory('all'); }}
                className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeCategory === 'all' && !isAdminOpen
                    ? 'bg-slate-100 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Tất cả
              </button>

              <button
                id="nav-iphone-btn"
                onClick={() => { setActiveCategory('iphone'); }}
                className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeCategory === 'iphone' && !isAdminOpen
                    ? 'bg-slate-100 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                iPhone
              </button>

              <button
                id="nav-ipad-btn"
                onClick={() => { setActiveCategory('ipad'); }}
                className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeCategory === 'ipad' && !isAdminOpen
                    ? 'bg-slate-100 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                iPad
              </button>

              <div className="w-[1px] h-4 bg-gray-200 mx-1 hidden sm:block"></div>

              <button
                id="nav-cart-btn"
                onClick={onOpenCart}
                className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {cartCount > 0 ? (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10.5px]">(0)</span>
                )}
              </button>

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 shadow-sm transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="max-w-[70px] truncate">{currentUser.TenKhachHang || currentUser.HoTen || 'User'}</span>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-xl py-1 z-50 text-slate-700">
                      <div className="px-4 py-2 border-b border-gray-100 text-xs text-slate-400">
                        Chào, <strong className="text-slate-800 font-bold">{currentUser.TenKhachHang || currentUser.HoTen}</strong>
                      </div>
                      
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => { onOpenAdmin(); setShowUserDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 ${isAdminOpen ? 'text-blue-600 font-semibold' : ''}`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                          <span>Trang Quản trị</span>
                        </button>
                      )}

                      <button
                        onClick={() => { onLogout(); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-slate-50 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    id="nav-login-btn"
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    Đăng nhập
                  </button>

                  <button
                    id="nav-register-btn"
                    onClick={() => onOpenAuth('register')}
                    className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 hidden sm:inline"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Right Search Bar */}
          <div className="relative w-full md:w-64" id="ducstore-search-container">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/50" />
            </span>
            <input
              id="product-search-input"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-8 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/60 hover:text-white text-xs"
              >
                Xóa
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
