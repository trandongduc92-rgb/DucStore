/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, KeyRound, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onLoginSuccess: (user: any, role: 'customer' | 'admin') => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode,
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Password: password })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Tài khoản hoặc mật khẩu không đúng!");
      }
      
      onLoginSuccess(result.user, result.role);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Email: regEmail,
          MatKhau: regPassword,
          TenKhachHang: regName,
          DienThoai: regPhone,
          DiaChi: regAddress
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Đăng ký không thành công!");
      }

      alert("Hệ thống đã tạo tài khoản khách hàng thành công! Đang tự động đăng nhập...");
      onLoginSuccess(result.user, result.role);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" id="auth-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all my-8 w-full max-w-md p-6">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo brand label */}
          <div className="text-center space-y-2 mb-6">
            <span className="text-sm font-black text-blue-600 tracking-widest uppercase">DUCSTORE</span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Khách Hàng'}
            </h2>
            <p className="text-xs text-slate-500">
              Trang mua sắm thiết bị Apple iPhone & iPad chính hãng tốt nhất
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 text-xs font-medium text-red-600 border border-red-100 text-center">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4" id="login-form">
              {/* Account / Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Email khách hàng hoặc Admin username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin hoặc email của bạn..."
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Submit triggers */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:bg-slate-400"
                >
                  {loading ? 'Đang xác thực thông tin...' : 'Đăng nhập ngay'}
                </button>
              </div>

              {/* Tester Help Box */}
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 flex gap-2 text-xs text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Đăng nhập Quản trị viên nhanh:</span>
                  <p className="mt-0.5 text-[11px]">Tài khoản: <strong className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200/60">admin</strong> / Mật khẩu: <strong className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200/60">admin123</strong></p>
                </div>
              </div>

              {/* Toggle option */}
              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                Chưa có tài khoản khách hàng?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5" id="register-form">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Họ và Tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ví dụ: Trần Đông Đức"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Địa chỉ Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Viết thư điện tử của bạn..."
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Số điện thoại nhận hàng..."
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Thiết lập mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mật khẩu tối thiểu 6 ký tự..."
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Địa chỉ giao hàng mặc định</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <textarea
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Địa chỉ nhận hàng chi tiết..."
                    rows={2}
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400 resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:bg-slate-400"
                >
                  {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký tài khoản khách'}
                </button>
              </div>

              {/* Toggle option */}
              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                Đã có tài khoản rồi?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
