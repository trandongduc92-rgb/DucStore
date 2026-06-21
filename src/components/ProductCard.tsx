/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { SanPham } from '../types';

interface ProductCardProps {
  key?: string;
  product: SanPham;
  onAddToCart: (product: SanPham) => void;
  onViewDetail: (product: SanPham) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetail,
}: ProductCardProps) {
  
  // Clean VND formatting: e.g. 29.990.000 đ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Determine actual image source route.
  // If it's just a filename (like info14.png), request from our static images path '/images/...'
  // Otherwise, if it's already an external URL, load it directly.
  const getImageSrc = (imgPath: string) => {
    if (!imgPath) return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath;
    }
    return `/images/${imgPath}`;
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group" 
      id={`sanpham-card-${product.MaSanPham}`}
    >
      {/* Target image with ribbon */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-5">
        
        {/* Category tag */}
        <span className="absolute top-3 left-3 bg-slate-100 text-slate-600 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 border border-gray-200/50 shadow-sm">
          {product.MaDanhMuc === 'iphone' ? 'iPhone' : 'iPad'}
        </span>

        {product.Gia > 20000000 && (
          <span className="absolute top-3 right-3 bg-blue-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider z-10 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 fill-white" />
            <span>Premium</span>
          </span>
        )}

        {/* Product image with mouseover scale effect */}
        <img
          src={getImageSrc(product.HinhAnh)}
          alt={product.TenSanPham}
          className="max-h-[160px] max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // fallback
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80';
          }}
          referrerPolicy="no-referrer"
        />

        {/* Hover quick action overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300">
          <button 
            onClick={() => onViewDetail(product)}
            className="p-2.5 bg-white hover:bg-slate-150 hover:scale-110 text-slate-900 rounded-full shadow-md transition-all border border-gray-200/50"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          {/* Title - styled to look sleek and compact */}
          <h4 
            onClick={() => onViewDetail(product)}
            className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1 group-hover:line-clamp-2 transition-colors duration-200"
          >
            {product.TenSanPham}
          </h4>

          {/* Price display with exact blue color matching the Sleek Interface specs */}
          <p className="text-blue-600 font-bold text-sm">
            {formatPrice(product.Gia)}
          </p>

          {/* Dynamic description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
            {product.MoTa || 'Hàng chính hãng VN/A nguyên seal bảo hành AppleCare toàn quốc.'}
          </p>

          {/* Category indicator exactly matching Sleek Interface card design */}
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-2">
            Danh mục: {product.MaDanhMuc === 'iphone' ? 'iPhone' : 'iPad'}
          </div>
        </div>

        {/* Actions Button */}
        <div className="pt-3.5 mt-auto">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2 px-3 bg-[#003366] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Thêm vào giỏ hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
