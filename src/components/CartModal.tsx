/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, CreditCard } from 'lucide-react';
import { GioHangItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: GioHangItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (address: string, customerName?: string) => Promise<string | null>;
  currentUser: { TenKhachHang?: string; Email?: string; MaKhachHang?: string } | null;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  currentUser,
}: CartModalProps) {
  const [address, setAddress] = useState(currentUser?.MaKhachHang ? 'Hà Nội, Việt Nam' : '');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Formatting helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.SanPham.Gia * item.SoLuong,
    0
  );

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!address.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderId = await onCheckout(
        address,
        currentUser?.TenKhachHang || guestName || 'Khách Vãng Lai'
      );
      if (orderId) {
        setLastOrderId(orderId);
      }
    } catch (e) {
      console.error(e);
      alert("Đặt hàng không thành công, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" id="cart-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all my-8 w-full max-w-2xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Giỏ Hàng Của Bạn</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {lastOrderId ? (
            /* Success State */
            <div className="flex-grow p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm animate-pulse">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Đặt Hàng Thành Công!</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Đơn hàng <strong className="text-blue-600">#{lastOrderId}</strong> của bạn đã được ghi nhận vào hệ thống DucStore. Đội ngũ kỹ thuật sẽ xác minh và giao hàng sớm nhất có thể.
              </p>
              <button
                onClick={() => {
                  setLastOrderId(null);
                  setAddress('');
                  setGuestName('');
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            /* Main Content Form */
            <div className="flex-grow overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              
              {/* Product list */}
              <div className="flex-grow flex flex-col space-y-4 md:w-3/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách sản phẩm ({cartItems.length})</h3>
                
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                    <ShoppingBag className="w-12 h-12 stroke-1" />
                    <p className="text-sm">Chưa có sản phẩm nào trong giỏ hàng!</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.SanPham.MaSanPham}
                        className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50"
                        id={`cart-item-${item.SanPham.MaSanPham}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              item.SanPham.HinhAnh &&
                              (item.SanPham.HinhAnh.startsWith('http') || item.SanPham.HinhAnh.startsWith('data:'))
                                ? item.SanPham.HinhAnh
                                : `/images/${item.SanPham.HinhAnh}`
                            }
                            alt={item.SanPham.TenSanPham}
                            className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80';
                            }}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.SanPham.TenSanPham}</h4>
                            <span className="text-[11px] font-medium text-blue-600">{formatPrice(item.SanPham.Gia)}</span>
                          </div>
                        </div>

                        {/* Adjust quantity triggers */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-white border border-slate-100 rounded-xl p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.SanPham.MaSanPham, -1)}
                              className="p-1 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
                              disabled={item.SoLuong <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800">{item.SoLuong}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.SanPham.MaSanPham, 1)}
                              className="p-1 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.SanPham.MaSanPham)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-summary */}
                {cartItems.length > 0 && (
                  <div className="border-t border-dashed border-slate-100 pt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Cơ sở phân phối</span>
                      <span className="font-medium text-slate-800">DucStore Apple Center</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Thuế VAT (8%)</span>
                      <span className="font-medium text-slate-800">Đã bao gồm</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800">Tổng cộng thanh toán:</span>
                      <span className="font-black text-blue-600 text-base">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Info Form column */}
              {cartItems.length > 0 && (
                <form onSubmit={handleCheckoutSubmit} className="md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Thông tin thanh toán</span>
                    </h3>

                    {/* Account Indicator */}
                    <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-50 text-xs text-slate-600">
                      {currentUser ? (
                        <span>
                          Bạn đang đặt hàng với tài khoản: <strong className="text-blue-900">{currentUser.TenKhachHang}</strong> ({currentUser.Email})
                        </span>
                      ) : (
                        <span>
                          Bạn chưa đăng nhập. Vui lòng nhập họ tên nhận hàng bên dưới hoặc đăng nhập để lưu trữ lịch sử đơn hàng.
                        </span>
                      )}
                    </div>

                    {/* Guest custom name when not authorized */}
                    {!currentUser && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Tên người nhận <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Ví dụ: Trần Đông Đức"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                        />
                      </div>
                    )}

                    {/* Address Field */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                        rows={3}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/10 active:scale-95 disabled:bg-slate-400"
                    >
                      {isSubmitting ? (
                        <span>Đang xử lý đặt hàng...</span>
                      ) : (
                        <>
                          <span>Xác nhận đặt hàng</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
