/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Tag, DollarSign, FileText, Image, Upload, 
  X, ShieldCheck, RefreshCw, ShoppingCart, Check, Clock,
  BarChart3, TrendingUp, RotateCcw, ShieldAlert, Calendar, 
  BadgePercent, BookOpen, HeartHandshake, Eye
} from 'lucide-react';
import { SanPham, DanhMuc, DonHang } from '../types';

// Custom lightweight CMS line-styling parser for policy text block
function renderPolicyHTML(rawText: string): React.ReactNode[] {
  return rawText.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }
    
    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm sm:text-base font-black text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-2 text-left">
          {trimmed.replace('### ', '')}
        </h3>
      );
    }
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-xs font-black text-blue-600 mt-4 mb-2 uppercase tracking-wide text-left">
          {trimmed.replace('#### ', '')}
        </h4>
      );
    }
    
    // Bold list items: * **title**: details
    if (trimmed.startsWith('* **')) {
      const clean = trimmed.replace('* **', '').replace('**', '');
      const parts = clean.split(':');
      if (parts.length > 1) {
        return (
          <div key={idx} className="flex items-start gap-2.5 py-1 text-xs text-slate-600 text-left pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <span className="leading-relaxed">
              <strong className="text-slate-900 font-extrabold">{parts[0]}:</strong>
              {parts.slice(1).join(':')}
            </span>
          </div>
        );
      }
    }
    
    // Bullet point list: * details
    if (trimmed.startsWith('* ')) {
      return (
        <div key={idx} className="flex items-start gap-2.5 py-1 text-xs text-slate-600 text-left pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
          <span className="leading-relaxed">{trimmed.replace('* ', '')}</span>
        </div>
      );
    }
    
    // Horizontal divider
    if (trimmed === '---') {
      return <hr key={idx} className="my-5 border-slate-100" />;
    }
    
    // Standard paragraph layout
    return (
      <p key={idx} className="text-xs text-slate-500 leading-relaxed text-left mb-1">
        {trimmed}
      </p>
    );
  });
}

interface AdminPanelProps {
  products: SanPham[];
  categories: DanhMuc[];
  orders: DonHang[];
  onRefreshProducts: () => void;
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export default function AdminPanel({
  products,
  categories,
  orders,
  onRefreshProducts,
  onRefreshOrders,
  onUpdateOrderStatus
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'revenue' | 'policy'>('products');
  
  // States for revenue reports
  const [selectedReportYear, setSelectedReportYear] = useState<number>(2026); // Default 2026

  // States for Warranty & Refund CMS policy editor
  const [csBaoHanh, setCsBaoHanh] = useState<string>(() => {
    const saved = localStorage.getItem('ducstore_cs_baohanh');
    return saved || `### 🛡️ CHÍNH SÁCH BẢO HÀNH & ĐỔI TRẢ CHÍNH HÃNG DUCSTORE

DucStore cam kết mang đến tay khách hàng những sản phẩm Apple mới 100% chính hãng phân phối tại Việt Nam (VN/A) cùng dịch vụ hậu mãi tối ưu nhất.

---

#### 1. QUY ĐỊNH ĐỔI TRẢ (30 Ngày Đầu)
* **Lỗi từ nhà sản xuất**: Đổi mới ngay sản phẩm tương đương (cùng model, dung lượng, màu sắc). Trường hợp hết hàng, hoàn tiền 100% hoặc đổi sang dòng máy khác bù chênh lệch miễn phí.
* **Không lỗi**: Thu mua lại máy cũ với giá bằng **85%** giá trị hóa đơn (sản phẩm nguyên trạng, không trầy xước, đầy đủ hộp phụ kiện kèm theo).
* **Điều kiện đổi trả**: Máy giữ nguyên seal màn hình (nếu có), hộp trùng IMEI đầy đủ phụ kiện đi kèm, không trầy xước, móp méo, nứt vỡ.

#### 2. DỊCH VỤ BẢO HÀNH CHÍNH HÃNG VN/A (12 Tháng)
* Bảo hành phần cứng toàn diện **12 tháng** kể từ ngày giao hàng/kích hoạt AppleCare.
* Tiếp nhận bảo hành trực tiếp tại hệ thống **DucStore Việt Nam** hoặc gửi ủy quyền trực tiếp tới phòng kỹ thuật của các Trung tâm dịch vụ Apple (AASP) như Thakral One, ShopDunk Care, CareS...
* Linh kiện thay thế cam kết **100% linh kiện Certified Apple** chính quy chuẩn.

#### 3. CÁC TRƯỜNG HỢP TỪ CHỐI BẢO HÀNH
* Thiết bị có vết rơi vỡ, nứt móp cơ học, dính nước, ẩm cốc, hư hại hóa học hoặc cháy nổ do nguồn sạc dòng điện không ổn định.
* Thiết bị đã bị tự ý sửa chữa bẻ khóa (Jailbreak), tháo gỡ tem niêm phong hoặc can thiệp bởi bên thứ ba không thuộc ủy quyền của Apple.
* Mất tài khoản bảo mật iCloud cá nhân dính ẩn, mất FaceID/TouchID do tác động va đập vật lý.`;
  });

  const [activePolicySubTab, setActivePolicySubTab] = useState<'view' | 'edit'>('view');

  // Sync edits back to local storage
  useEffect(() => {
    localStorage.setItem('ducstore_cs_baohanh', csBaoHanh);
  }, [csBaoHanh]);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<SanPham | null>(null); // Null means Add Product, otherwise Edit Product

  // Form field states
  const [tenSanPham, setTenSanPham] = useState('');
  const [gia, setGia] = useState('');
  const [moTa, setMoTa] = useState('');
  const [maDanhMuc, setMaDanhMuc] = useState('iphone'); // Default
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload Helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCurrentImagePreview(URL.createObjectURL(file));
    }
  };

  // Open Form for Adding Product
  const handleOpenAddForm = () => {
    setEditProduct(null);
    setTenSanPham('');
    setGia('');
    setMoTa('');
    setMaDanhMuc('iphone');
    setSelectedFile(null);
    setCurrentImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing Product
  const handleOpenEditForm = (product: SanPham) => {
    setEditProduct(product);
    setTenSanPham(product.TenSanPham);
    setGia(product.Gia.toString());
    setMoTa(product.MoTa || '');
    setMaDanhMuc(product.MaDanhMuc);
    setSelectedFile(null);
    
    // Preview original image filename or URL path
    const originalPreviewUrl = product.HinhAnh.startsWith('http') 
      ? product.HinhAnh 
      : `/images/${product.HinhAnh}`;
    setCurrentImagePreview(originalPreviewUrl);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
    setIsFormOpen(true);
  };

  // Close Form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditProduct(null);
    setError(null);
  };

  // Handle Form Submission (Add or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!tenSanPham.trim() || !gia || !maDanhMuc) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      setIsLoading(false);
      return;
    }

    const priceNum = parseFloat(gia);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Giá sản phẩm phải là một số dương hợp lệ!");
      setIsLoading(false);
      return;
    }

    // Creating Multipart FormData
    const formData = new FormData();
    formData.append('TenSanPham', tenSanPham.trim());
    formData.append('Gia', priceNum.toString());
    formData.append('MoTa', moTa.trim());
    formData.append('MaDanhMuc', maDanhMuc.toLowerCase());

    if (selectedFile) {
      formData.append('hinhAnhFile', selectedFile);
    }

    const url = editProduct 
      ? `/api/sanpham/${editProduct.MaSanPham}` 
      : '/api/sanpham';
    const method = editProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        body: formData, // Automatically sets headers to multipart/form-data with boundary
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gặp lỗi trong quá trình ghi dữ liệu!");
      }

      alert(editProduct ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
      handleCloseForm();
      onRefreshProducts();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể thực hiện tác vụ, hãy kiểm tra lại kết nối!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Product Deletion
  const handleDeleteProduct = async (maSanPham: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" khỏi kệ hàng? Tác vụ này không thể phục hồi.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sanpham/${maSanPham}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Không thể xóa sản phẩm này!");
      }
      alert("Xóa sản phẩm thành công!");
      onRefreshProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Helper formatting price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // --- DOANH THU & QUY STATS CALCULATIONS ---
  const approvedOrdersOnly = orders.filter(o => o.TrangThai === 'Đã duyệt');

  const getStatsForYear = (yr: number) => {
    let yrTotal = 0;
    let yrCount = 0;
    const monthSales = Array(12).fill(0);
    const monthOrderCounts = Array(12).fill(0);

    approvedOrdersOnly.forEach(o => {
      const d = new Date(o.NgayDat);
      if (d.getFullYear() === yr) {
        const m = d.getMonth();
        yrTotal += o.TongTien;
        yrCount++;
        if (m >= 0 && m < 12) {
          monthSales[m] += o.TongTien;
          monthOrderCounts[m]++;
        }
      }
    });

    return {
      yrTotal,
      yrCount,
      monthSales,
      monthOrderCounts
    };
  };

  const currentYrStats = getStatsForYear(selectedReportYear);
  const maxRevenueInMonth = Math.max(...currentYrStats.monthSales, 10000000); // minimum scale index

  // Quarters for selected year
  const q1Revenue = currentYrStats.monthSales[0] + currentYrStats.monthSales[1] + currentYrStats.monthSales[2];
  const q2Revenue = currentYrStats.monthSales[3] + currentYrStats.monthSales[4] + currentYrStats.monthSales[5];
  const q3Revenue = currentYrStats.monthSales[6] + currentYrStats.monthSales[7] + currentYrStats.monthSales[8];
  const q4Revenue = currentYrStats.monthSales[9] + currentYrStats.monthSales[10] + currentYrStats.monthSales[11];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-panel-container">
      {/* Banner introduction with premium badge */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 shadow-md relative overflow-hidden">
        <div className="space-y-2 z-10 text-left">
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-white/10 text-blue-100 text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 fill-blue-400 text-indigo-950" />
            <span>DucStore Security Control Panel</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Hệ Thống Quản Trị Cửa Hàng</h2>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Nơi quản lý tập trung kho sản phẩm Apple chính hãng (iPhone, iPad). Cập nhật nhanh chóng bảng giá, thêm mới, sửa đổi thông tin hoặc quản lý danh sách đơn đặt hàng từ khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button 
            onClick={() => { onRefreshProducts(); onRefreshOrders(); }}
            className="p-3 bg-white/10 hover:bg-white/20 hover:text-white text-white rounded-xl transition-all border border-white/20 flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Đồng bộ lại"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Đồng bộ</span>
          </button>
          
          <button
            onClick={handleOpenAddForm}
            className="px-5 py-3 bg-white text-blue-800 hover:bg-blue-50 hover:scale-[1.02] font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all text-center"
            id="admin-add-product-btn"
          >
            <Plus className="w-4 h-4 shrink-0 text-blue-700" />
            <span>Thêm sản phẩm mới</span>
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl z-0"></div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 mb-6 gap-2" id="admin-tabs">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider relative transition-all ${
            activeTab === 'products' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>Kho Sản Phẩm ({products.length})</span>
          {activeTab === 'products' && <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600" />}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider relative transition-all ${
            activeTab === 'orders' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>Đơn Hàng ({orders.length})</span>
          {activeTab === 'orders' && <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600" />}
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider relative transition-all ${
            activeTab === 'revenue' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>Báo cáo doanh thu</span>
          {activeTab === 'revenue' && <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600" />}
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider relative transition-all ${
            activeTab === 'policy' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>Chính sách đổi trả bảo hành</span>
          {activeTab === 'policy' && <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      {activeTab === 'products' ? (
        /* Products grid/table strictly rendering columns as requested: image, name, category, price, edit, delete */
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm" id="admin-products-table">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-24">Ảnh sản phẩm</th>
                  <th className="py-4 px-6">Tên sản phẩm</th>
                  <th className="py-4 px-6">Phân loại danh mục</th>
                  <th className="py-4 px-6">Giá niêm yết (VND)</th>
                  <th className="py-4 px-6 text-right">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Kho hàng rỗng! Vui lòng Thêm sản phẩm mới ở phía trên.
                    </td>
                  </tr>
                ) : (
                  products.map((sp) => (
                    <tr key={sp.MaSanPham} className="hover:bg-slate-50/40 transition-colors" id={`admin-row-${sp.MaSanPham}`}>
                      {/* Image column */}
                      <td className="py-4 px-6">
                        <img
                          src={
                            sp.HinhAnh && (sp.HinhAnh.startsWith('http') || sp.HinhAnh.startsWith('data:'))
                              ? sp.HinhAnh
                              : `/images/${sp.HinhAnh}`
                          }
                          alt={sp.TenSanPham}
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80';
                          }}
                          referrerPolicy="no-referrer"
                        />
                      </td>

                      {/* Name column */}
                      <td className="py-4 px-6 font-bold text-slate-900 max-w-xs truncate">
                        {sp.TenSanPham}
                      </td>

                      {/* Category column */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sp.MaDanhMuc === 'iphone' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {sp.MaDanhMuc === 'iphone' ? 'iPhone' : 'iPad'}
                        </span>
                      </td>

                      {/* Price column */}
                      <td className="py-4 px-6 font-black text-slate-800 font-sans">
                        {formatPrice(sp.Gia)}
                      </td>

                      {/* Actions: Edit , Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditForm(sp)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Sửa thông tin sản phẩm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(sp.MaSanPham, sp.TenSanPham)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders management section */
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm" id="admin-orders-table">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã Đơn Hàng</th>
                  <th className="py-4 px-6">Khách hàng nhận</th>
                  <th className="py-4 px-6">Ngày đặt</th>
                  <th className="py-4 px-6">Tổng giá thanh toán</th>
                  <th className="py-4 px-6">Trạng thái hiện tại</th>
                  <th className="py-4 px-6 text-right">Thao tác cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Chưa có đơn hàng nào được ghi nhận trên hệ thống!
                    </td>
                  </tr>
                ) : (
                  orders.map((dh) => (
                    <tr key={dh.MaDonHang} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">
                        #{dh.MaDonHang}
                      </td>
                      <td className="py-4 px-6">
                        <strong className="text-slate-900 block">{dh.TenKhachHang}</strong>
                        <span className="text-[10px] text-slate-400 block max-w-[200px] truncate">{dh.DiaChiGiaoHang}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(dh.NgayDat).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-4 px-6 font-black font-sans text-slate-900">
                        {formatPrice(dh.TongTien)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          dh.TrangThai === 'Đã duyệt' 
                            ? 'bg-emerald-50 text-emerald-600'
                            : dh.TrangThai === 'Đã hủy'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {dh.TrangThai === 'Đã duyệt' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3 animate-spin duration-3000" />
                          )}
                          <span>{dh.TrangThai}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {dh.TrangThai === 'Chờ duyệt' && (
                            <>
                              <button
                                onClick={() => onUpdateOrderStatus(dh.MaDonHang, 'Đã duyệt')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => onUpdateOrderStatus(dh.MaDonHang, 'Đã hủy')}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-400 hover:text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Hủy đơn
                              </button>
                            </>
                          )}
                          {dh.TrangThai === 'Đã duyệt' && (
                            <span className="text-[11px] text-emerald-500 font-semibold italic">Đã xử lý!</span>
                          )}
                          {dh.TrangThai === 'Đã hủy' && (
                            <span className="text-[11px] text-red-400 font-semibold italic">Bị hủy bỏ</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'revenue' ? (
        /* --- REPORTING ANALYTICS MODULE --- */
        <div className="space-y-6 text-left" id="admin-revenue-reports">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Month Revenue */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Doanh Thu Tháng {selectedReportYear === 2026 ? "6" : "12"} ({selectedReportYear})</span>
                <p className="text-lg sm:text-xl font-black text-slate-900 font-sans">
                  {formatPrice(selectedReportYear === 2026 ? (currentYrStats.monthSales[5] || 0) : (currentYrStats.monthSales[11] || 0))}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                  <span className="text-emerald-500">+{selectedReportYear === 2026 ? (currentYrStats.monthOrderCounts[5] || 0) : (currentYrStats.monthOrderCounts[11] || 0)} đơn đã giao</span>
                  <span>thành công</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Quarter Revenue */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Doanh Thu Quý 2 ({selectedReportYear})</span>
                <p className="text-lg sm:text-xl font-black text-slate-900 font-sans">
                  {formatPrice(q2Revenue)}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <span className="text-amber-500">Q2 chiếm {currentYrStats.yrTotal > 0 ? Math.round((q2Revenue / currentYrStats.yrTotal) * 100) : 0}%</span>
                  <span className="text-slate-400">của cả năm</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Year Revenue */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Doanh Thu Cả Năm ({selectedReportYear})</span>
                <p className="text-lg sm:text-xl font-black text-slate-900 font-sans">
                  {formatPrice(currentYrStats.yrTotal)}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                  <span className="text-indigo-600">Tổng cộng {currentYrStats.yrCount} giao dịch</span>
                  <span>thành công</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Accumulated Revenue */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tổng Doanh Số Tích Lũy</span>
                <p className="text-lg sm:text-xl font-black text-slate-900 font-sans">
                  {formatPrice(approvedOrdersOnly.reduce((sum, o) => sum + o.TongTien, 0))}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                  <span className="text-blue-600">Ổn định thị phần</span>
                  <span>Apple Authorized</span>
                </div>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Interactive Chart & Year Selector Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Biểu đồ doanh số chi tiết bám sát thực tế tháng ({selectedReportYear})</h3>
                <p className="text-[11px] text-slate-400">Rê chuột lên từng cột mốc tháng để xem giá trị chi tiết đã duyệt sổ.</p>
              </div>

              {/* Selector buttons for year */}
              <div className="inline-flex rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0 self-start sm:self-center">
                <button
                  onClick={() => setSelectedReportYear(2026)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedReportYear === 2026 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-705'
                  }`}
                >
                  Năm 2026
                </button>
                <button
                  onClick={() => setSelectedReportYear(2025)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedReportYear === 2025 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-705'
                  }`}
                >
                  Năm 2025
                </button>
              </div>
            </div>

            {/* Custom Interactive SVG/CSS Bar Chart Grid */}
            <div className="relative pt-4 pb-2">
              <div className="flex items-end justify-between h-48 border-b border-dashed border-slate-200 px-2 sm:px-6 gap-2 relative">
                {/* Chart Guide Y-axis indicator */}
                <div className="absolute top-0 right-2 text-[10px] text-slate-400 font-mono font-bold bg-slate-50/80 px-2 py-0.5 rounded border border-slate-100 pointer-events-none">
                  Cao nhất tuyển dụng: {formatPrice(Math.round(maxRevenueInMonth / 100000) * 100000)}
                </div>

                {currentYrStats.monthSales.map((revenueVal, mIdx) => {
                  const pct = Math.max(4, maxRevenueInMonth > 1 ? (revenueVal / maxRevenueInMonth) * 100 : 4);
                  const isCurrentMonth = selectedReportYear === 2026 && mIdx === 5;
                  
                  return (
                    <div key={mIdx} className="flex-1 flex flex-col items-center group relative">
                      {/* Interactive hover tooltip box */}
                      <div className="absolute bottom-full mb-2 bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 shadow-xl opacity-0 transform translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all pointer-events-none z-20 w-36 text-center text-[10px] space-y-1 font-sans">
                        <p className="font-bold border-b border-white/10 pb-0.5 text-blue-400 uppercase tracking-widest text-[9px]">Tháng {mIdx + 1}</p>
                        <p className="font-black text-xs text-white leading-normal font-sans">{formatPrice(revenueVal)}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{currentYrStats.monthOrderCounts[mIdx] || 0} đơn đã duyệt</p>
                      </div>

                      {/* Bar columns */}
                      <div className="w-full max-w-[28px] sm:max-w-[40px] relative transition-all duration-300">
                        {/* Interactive dynamic background indicator */}
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-700 relative overflow-hidden ${
                            revenueVal > 0 
                              ? isCurrentMonth
                                ? 'bg-gradient-to-t from-blue-700 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-400 shadow-md shadow-blue-500/10'
                                : 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-blue-600 group-hover:to-indigo-400 shadow-sm'
                              : 'bg-slate-50 group-hover:bg-slate-100'
                          }`}
                          style={{ height: `${pct}%`, minHeight: '6px' }}
                        >
                          {revenueVal > 0 && (
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-white/20 animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Month index label under columns */}
                      <span className={`text-[10px] mt-3 font-bold transition-colors ${
                        isCurrentMonth ? 'text-blue-600 font-extrabold' : 'text-slate-400 group-hover:text-slate-800'
                      }`}>
                        T.{mIdx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Description Grid under the chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100 text-xs text-left">
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Phân Tịch Thống Kê Dòng Tiền</h4>
                <div className="space-y-2 text-slate-500 leading-relaxed">
                  <p>
                    Biểu đồ doanh số thể hiện các đơn hàng đã được phê duyệt ở trạng thái <strong>Đã duyệt</strong>. Các hóa đơn đang ở trạng thái <strong>Chờ duyệt</strong> hoặc <strong>Đã hủy</strong> được lược bỏ khỏi đồ thị doanh số nhằm đảo bảo độ trung thực cao nhất của doanh thu bán hàng thực tế.
                  </p>
                  <p>
                    Doanh thu được cập nhật trực tiếp tại hệ thống máy chủ, phản ánh tức thì tiến độ kinh doanh của thương hiệu DucStore.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-slate-100">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-[9px]">DOANH SỐ CÁC QUÝ TRONG NĂM {selectedReportYear}</h4>
                  <div className="space-y-2 text-[11px] font-medium">
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">Quý I (Tháng 1 - Tháng 3):</span>
                      <strong className="text-slate-800 font-mono font-bold">{formatPrice(q1Revenue)}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                      <span className="text-blue-600 font-extrabold">Quý II (Tháng 4 - Tháng 6):</span>
                      <strong className="text-blue-600 font-mono font-extrabold">{formatPrice(q2Revenue)}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">Quý III (Tháng 7 - Tháng 9):</span>
                      <strong className="text-slate-800 font-mono font-bold">{formatPrice(q3Revenue)}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Quý IV (Tháng 10 - Tháng 12):</span>
                      <strong className="text-slate-800 font-mono font-bold">{formatPrice(q4Revenue)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/65 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dữ liệu báo cáo tài chính bảo chính tại trung tâm phân phối Apple Việt Nam VN/A.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- WARRANTY & REFUND POLICY CMS PANEL --- */
        <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm text-left" id="admin-policy-section">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Cổng Quản Trị & Biên Tập Chính Sách Đổi Trả, Bảo Hành</h3>
              <p className="text-[11px] text-slate-400">Tùy biến nội dung chính sách hiển thị tới khách hàng trực quan trên hệ thống.</p>
            </div>

            {/* CMS Sub tabs view/edit */}
            <div className="inline-flex rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0 self-start sm:self-center">
              <button
                onClick={() => setActivePolicySubTab('view')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePolicySubTab === 'view' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem thực tế</span>
              </button>
              <button
                onClick={() => setActivePolicySubTab('edit')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePolicySubTab === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Biên tập viên (CMS)</span>
              </button>
            </div>
          </div>

          {activePolicySubTab === 'view' ? (
            /* Policy Live Preview card layout */
            <div className="space-y-6 max-w-4xl mx-auto py-2">
              <div className="bg-blue-600/5 rounded-2xl p-4 sm:p-5 border border-blue-500/10 flex flex-col sm:flex-row gap-4 items-start">
                <ShieldCheck className="w-10 h-10 text-blue-600 shrink-0 bg-blue-100 p-2 rounded-xl" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-blue-800 tracking-wider">CHẾ ĐỘ HẬU MÃI TOÀN DIỆN</h4>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    Tất cả các dòng máy iPhone và iPad bán ra tại hệ thống <strong>DucStore</strong> đều được bảo chứng chính sách đổi mới khẩn cấp trong 30 ngày nếu có lỗi kỹ thuật từ nhà sản xuất, đi kèm cam kết sửa đổi thay thế linh kiện Apple chính phẩm suốt 1 năm.
                  </p>
                </div>
              </div>

              {/* Parsed Dynamic Policy render */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 sm:p-7 space-y-3.5 shadow-inner">
                {renderPolicyHTML(csBaoHanh)}
              </div>

              {/* Small Badges Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-600">Linh kiện Apple 100% Chính Hãng</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-600">Đổi mới cấp tốc trong 30 ngày</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-600">Ủy quyền Applecare Toàn Quốc</span>
                </div>
              </div>
            </div>
          ) : (
            /* CMS Editor layout */
            <div className="space-y-4 max-w-4xl mx-auto py-2">
              <div className="space-y-1 text-left mb-2">
                <label className="text-xs font-extrabold text-slate-700">Trình biên tập văn bản Thô CHÍNH SÁCH</label>
                <p className="text-[10px] text-slate-400">Gõ dấu ### cho tiêu đề lớn, #### cho tiêu đề nhỏ và dấu * cho danh sách liệt kê dòng.</p>
              </div>

              <textarea
                value={csBaoHanh}
                onChange={(e) => setCsBaoHanh(e.target.value)}
                rows={16}
                className="w-full text-xs font-mono p-4 sm:p-5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed font-sans"
                placeholder="Nhập nội dung chính sách bảo hành, đổi trả mới..."
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn cấu hình lại chính sách về trạng thái gốc ban đầu? Mọi chỉnh sửa của bạn sẽ bị xóa.")) {
                      localStorage.removeItem('ducstore_cs_baohanh');
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Khôi phục mặc định
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('ducstore_cs_baohanh', csBaoHanh);
                    alert("Đã cập nhật hệ thống thành công! Nội dung chính sách đổi trả bảo hành mới đã được ghi nhận và lưu trữ lâu dài.");
                    setActivePolicySubTab('view');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                >
                  Lưu thay đổi chính sách
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creat & Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" id="admin-form-modal">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseForm}
          />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all my-8 w-full max-w-lg p-6 flex flex-col">
              
              <button
                onClick={handleCloseForm}
                className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 mb-6 text-center sm:text-left">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">FORM QUẢN LÝ SẢN PHẨM</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editProduct ? 'Cập Nhật Sản Phẩm Apple' : 'Thêm Sản Phẩm Apple Mới'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editProduct ? 'Chỉnh sửa các trường dữ liệu và lưu lại thay đổi.' : 'Khởi tạo bản ghi phần cứng iPhone hoặc iPad.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 text-xs font-semibold text-red-600 border border-red-100 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4" id="admin-product-form">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Tên sản phẩm Apple <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Tag className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={tenSanPham}
                      onChange={(e) => setTenSanPham(e.target.value)}
                      placeholder="Ví dụ: iPhone 15 Pro Max 512GB..."
                      className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Giá bán (VND) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <DollarSign className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={gia}
                        onChange={(e) => setGia(e.target.value)}
                        placeholder="Ví dụ: 29990000"
                        className="w-full text-xs pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Category - Strict choice as requested: iPhone or iPad */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Danh mục sản phẩm <span className="text-red-500">*</span></label>
                    <select
                      value={maDanhMuc}
                      onChange={(e) => setMaDanhMuc(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="iphone">iPhone</option>
                      <option value="ipad">iPad</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Mô tả thông số chi tiết</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-slate-400">
                      <FileText className="w-4 h-4" />
                    </span>
                    <textarea
                      value={moTa}
                      onChange={(e) => setMoTa(e.target.value)}
                      placeholder="Mô tả cấu hình thiết bị, thời gian bảo hành và tình trạng máy..."
                      rows={3}
                      className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400 resize-none"
                    />
                  </div>
                </div>

                {/* File Upload image Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    {editProduct ? 'Thay đổi ảnh sản phẩm (Tùy chọn)' : 'Upload ảnh sản phẩm từ máy tính'}
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-200 bg-slate-50 rounded-2xl">
                    {currentImagePreview && (
                      <div className="relative w-20 h-20 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-inner">
                        <img 
                          src={currentImagePreview} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-grow w-full">
                      <div className="flex items-center md:items-start justify-center flex-col">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-97 w-full sm:w-auto"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Duyệt ảnh từ máy tính</span>
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1.5 text-center sm:text-left">
                          {selectedFile 
                            ? `Đã chọn: ${selectedFile.name}` 
                            : editProduct 
                            ? `Ảnh cũ đang sử dụng: ${editProduct.HinhAnh}` 
                            : 'Hỗ trợ các định dạng JPEG, PNG, WEBP tối đa 10MB.'
                          }
                        </p>
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-all"
                    disabled={isLoading}
                  >
                    Hủy bỏ
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1 shadow-lg shadow-blue-600/10 active:scale-95 disabled:bg-slate-400"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Đang lưu trữ dữ liệu...' : editProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
