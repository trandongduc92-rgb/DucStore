/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { SanPham, DanhMuc, DonHang, GioHangItem } from './types';
import { Sparkles, Phone, Mail, MapPin, Compass, ShieldCheck, Heart, ArrowRight, X, Check } from 'lucide-react';

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
        <h3 key={idx} className="text-sm font-black text-slate-900 mt-5 border-b border-slate-100 pb-2 text-left">
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
          <div key={idx} className="flex items-start gap-2 py-1 text-[11px] text-slate-600 text-left pl-1">
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
        <div key={idx} className="flex items-start gap-2 py-1 text-[11px] text-slate-600 text-left pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
          <span className="leading-relaxed">{trimmed.replace('* ', '')}</span>
        </div>
      );
    }
    
    // Horizontal divider
    if (trimmed === '---') {
      return <hr key={idx} className="my-4 border-slate-100" />;
    }
    
    // Standard paragraph layout
    return (
      <p key={idx} className="text-[11px] text-slate-500 leading-relaxed text-left mb-1">
        {trimmed}
      </p>
    );
  });
}

export default function App() {
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [products, setProducts] = useState<SanPham[]>([]);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Consumer Policy visibility state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [csBaoHanh, setCsBaoHanh] = useState<string>(() => {
    return localStorage.getItem('ducstore_cs_baohanh') || `### 🛡️ CHÍNH SÁCH BẢO HÀNH & ĐỔI TRẢ CHÍNH HÃNG DUCSTORE

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

#### 3. CÁC TRƯỜNG HỢP TỔNG TÀI TỪ CHỐI BẢO HÀNH
* Thiết bị có vết rơi vỡ, nứt móp cơ học, dính nước, ẩm cốc, hư hại hóa học hoặc cháy nổ do nguồn sạc dòng điện không ổn định.
* Thiết bị đã bị tự ý sửa chữa bẻ khóa (Jailbreak), tháo gỡ tem niêm phong hoặc can thiệp bởi bên thứ ba không thuộc ủy quyền của Apple.
* Mất tài khoản bảo mật iCloud cá nhân dính ẩn, mất FaceID/TouchID do tác động va đập vật lý.`;
  });

  // Re-sync policy from localStorage whenever active tab changes, in case it was edited in admin mode
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ducstore_cs_baohanh');
      if (saved) {
        setCsBaoHanh(saved);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also periodically poll to sync instantly without full page refresh
    const interval = setInterval(() => {
      const saved = localStorage.getItem('ducstore_cs_baohanh');
      if (saved && saved !== csBaoHanh) {
        setCsBaoHanh(saved);
      }
    }, 1500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [csBaoHanh]);

  // Cart & Auth states backed by localStorage
  const [cartItems, setCartItems] = useState<GioHangItem[]>(() => {
    const saved = localStorage.getItem('ducstore_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<{ MaKhachHang?: string; TenKhachHang?: string; Email?: string; HoTen?: string; TenDangNhap?: string } | null>(() => {
    const saved = localStorage.getItem('ducstore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRole, setCurrentRole] = useState<'customer' | 'admin' | null>(() => {
    return (localStorage.getItem('ducstore_role') as 'customer' | 'admin') || null;
  });

  // Modal display toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<SanPham | null>(null);

  // Sync Cart to local storage on change
  useEffect(() => {
    localStorage.setItem('ducstore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Initial Boot Data Loading
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Fetch orders when user or role changes, or when admin logs in
  useEffect(() => {
    fetchOrders();
  }, [currentUser, currentRole]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/danhmuc');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/sanpham');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to load products:", e);
    }
  };

  const fetchOrders = async () => {
    try {
      let url = '/api/orders';
      if (currentRole === 'customer' && currentUser?.MaKhachHang) {
        url += `?maKhachHang=${currentUser.MaKhachHang}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    }
  };

  // Auth Action Handlers
  const handleLoginSuccess = (user: any, role: 'customer' | 'admin') => {
    setCurrentUser(user);
    setCurrentRole(role);
    localStorage.setItem('ducstore_user', JSON.stringify(user));
    localStorage.setItem('ducstore_role', role);
    
    if (role === 'admin') {
      setIsAdminOpen(true);
      alert(`Xin chào Admin ${user.HoTen || 'Đức'}! Đã bật giao diện quản lý sản phẩm Apple.`);
    } else {
      setIsAdminOpen(false);
      alert(`Đăng nhập thành công! Chào mừng khách hàng ${user.TenKhachHang || 'Quý khách'}.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setIsAdminOpen(false);
    localStorage.removeItem('ducstore_user');
    localStorage.removeItem('ducstore_role');
    alert("Đã kết thúc phiên làm việc! Đăng xuất thành công.");
  };

  // Cart Operation Hooks
  const handleAddToCart = (product: SanPham) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.SanPham.MaSanPham === product.MaSanPham);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].SoLuong += 1;
        return updated;
      }
      return [...prev, { SanPham: product, SoLuong: 1 }];
    });
    alert(`Đã thêm "${product.TenSanPham}" vào giỏ hàng thành công!`);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.SanPham.MaSanPham === productId) {
            const nextQty = item.SoLuong + delta;
            return { ...item, SoLuong: Math.max(1, nextQty) };
          }
          return item;
        })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.SanPham.MaSanPham !== productId));
  };

  const handleCheckout = async (address: string, customerName?: string): Promise<string | null> => {
    try {
      const payload = {
        MaKhachHang: currentUser?.MaKhachHang || null,
        TenKhachHang: customerName || currentUser?.TenKhachHang || 'Khách đặt qua Web',
        DiaChiGiaoHang: address,
        CartItems: cartItems,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Có lỗi xảy ra khi gửi đơn đặt hàng.");
        return null;
      }

      // Order created successfully
      setCartItems([]); // Clear local cart
      fetchOrders(); // Refresh order records
      return result.orderId;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Admin Order Action: Approve / Cancel Order
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TrangThai: status })
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Gặp lỗi khi xử lý phê duyệt đơn.");
        return;
      }
      alert(`Đã duyệt chuyển trạng thái đơn hàng #${orderId} sang "${status}"!`);
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered products list to render
  const filteredProducts = products.filter((sp) => {
    // Category match
    const categoryMatch = activeCategory === 'all' || sp.MaDanhMuc.toLowerCase() === activeCategory.toLowerCase();
    
    // Search text query match
    const searchMatch = !searchQuery.trim() || 
      sp.TenSanPham.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (sp.MoTa && sp.MoTa.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && searchMatch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col font-sans text-slate-900 antialiased selection:bg-[#003366] selection:text-white pb-12">
      {/* 1. Header (Dark blue background with active rounded tab selectors) */}
      <Header
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setIsAdminOpen(false); // Entering categories toggles back to store shelf
        }}
        cartCount={cartItems.reduce((count, item) => count + item.SoLuong, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(!isAdminOpen)}
        isAdminOpen={isAdminOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main Content Frame */}
      {isAdminOpen ? (
        /* Render full-fidelity Admin Panel with strict CRUD constraints & file upload */
        <main className="flex-grow">
          <AdminPanel
            products={products}
            categories={categories}
            orders={orders}
            onRefreshProducts={fetchProducts}
            onRefreshOrders={fetchOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </main>
      ) : (
        /* Store Shelf Page */
        <div className="flex-grow flex flex-col">
          {/* Banner component directly below header */}
          <Banner />

          {/* Special highlights section for Trust and Authenticity */}
          <section className="bg-white border-y border-slate-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center space-x-3 p-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">100% Apple Authorized Dealer</h4>
                  <p className="text-[11px] text-slate-500">Hàng chính hãng VN/A nguyên seal bảo hành AppleCare.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 justify-center md:justify-start border-y md:border-y-0 md:border-x border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">Giao nhanh toàn quốc</h4>
                  <p className="text-[11px] text-slate-500">Chuyển phát bảo đảm siêu tốc 2H tại Hà Nội & HCM.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">Bảo Hành 1 Đổi 1</h4>
                  <p className="text-[11px] text-slate-500">Chính sách 30 ngày đổi mới nếu phát sinh lỗi phần cứng.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Product Shelf & Showcase Grid */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8">
            
            {/* Shelf Headline */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-5">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest font-mono">AUTHORIZED VN/A STOCK</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeCategory === 'all' ? 'Tất Cả Sản Phẩm Apple' : activeCategory === 'iphone' ? 'Bộ Sưu Tập iPhone' : 'Bộ Sưu Tập iPad'}
                </h2>
                <p className="text-xs text-slate-500">
                  Hiển thị các thiết bị Apple tối tân nhất thế giới hiện nay có tại kho lưu trữ DucStore.
                </p>
              </div>

              <div className="text-xs text-slate-400 mt-2 sm:mt-0 font-medium">
                Tìm thấy <strong className="text-slate-800 font-bold">{filteredProducts.length}</strong> thiết bị phù hợp
              </div>
            </div>

            {/* Product Rendering Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 text-center">
                <Compass className="w-16 h-16 stroke-1 text-slate-300 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800">Không tìm thấy sản phẩm hợp lệ!</h3>
                  <p className="text-xs text-slate-400 max-w-sm">Không tìm thấy sản phẩm nào khớp với tìm kiếm "{searchQuery}". Quay lại danh mục khác.</p>
                </div>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="px-6 py-2 bg-slate-900 text-white font-bold text-xs rounded-full transition-all hover:bg-slate-800"
                >
                  Hiển thị tất cả
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-shelf">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.MaSanPham}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetail={(p) => setSelectedDetailProduct(p)}
                  />
                ))}
              </div>
            )}

          </main>
        </div>
      )}

      {/* 3. Global Footer Component */}
      <footer className="border-t border-slate-200 bg-white mt-16 pt-12 pb-6 text-slate-600 text-xs" id="ducstore-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <span className="text-base font-black text-slate-900 tracking-wider">DucStore Việt Nam</span>
            <p className="text-slate-400 leading-relaxed pr-2">
              Chúng tôi tự hào là đại lý bán lẻ ủy quyền các sản phẩm Apple cao cấp, cung ứng dịch vụ chăm sóc khách hàng hàng đầu Việt Nam.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">Danh Mục Sản Phẩm</span>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { setActiveCategory('iphone'); setIsAdminOpen(false); }} className="hover:text-blue-600 transition-colors">
                  Điện thoại iPhone VN/A
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveCategory('ipad'); setIsAdminOpen(false); }} className="hover:text-blue-600 transition-colors">
                  Máy tính bảng iPad VN/A
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveCategory('all'); setIsAdminOpen(false); }} className="hover:text-blue-600 transition-colors">
                  Bộ sưu tập mới nhất
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">Bản quyền & Phát triển</span>
            <ul className="space-y-2 text-slate-400">
              <li>Mã dự án: <span className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">DucStore MVC</span></li>
              <li>Công nghệ: <span className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">Vite + React + Express</span></li>
              <li>Chủ sở hữu: <strong className="text-slate-700">Trần Đông Đức</strong></li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">Trụ Sở Chính</span>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Hoài Đức, Hà Nội, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+84 987 654 321</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>trandongduc92@gmail.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© 2026 DucStore. VN/A Authorised Reseller. Crafted by Trần Đông Đức.</p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-end">
            <button className="hover:text-blue-600">Điều khoản</button>
            <button className="hover:text-blue-600">Bảo mật</button>
            <button className="hover:text-blue-600">Cookies</button>
            <button 
              onClick={() => setIsPolicyModalOpen(true)} 
              className="hover:text-blue-700 font-extrabold text-[#003366] underline decoration-blue-500/30 hover:decoration-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chính sách đổi trả bảo hành</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Common Overlay Modals */}
      
      {/* 4a. Cart Modal with Checkout options and status indicators */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        currentUser={currentUser}
      />

      {/* 4b. Registration & Login (KhachHang or TaiKhoanAdmin) Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 4c. Individual Product Detail Modal */}
      {selectedDetailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col md:flex-row gap-6">
            <button 
              onClick={() => setSelectedDetailProduct(null)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-1/2 aspect-square flex items-center justify-center p-4 bg-slate-50 rounded-2xl">
              <img
                src={
                  selectedDetailProduct.HinhAnh && (selectedDetailProduct.HinhAnh.startsWith('http') || selectedDetailProduct.HinhAnh.startsWith('data:'))
                    ? selectedDetailProduct.HinhAnh
                    : `/images/${selectedDetailProduct.HinhAnh}`
                }
                alt={selectedDetailProduct.TenSanPham}
                className="max-w-full max-h-[180px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80';
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">VN/A Series</span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedDetailProduct.TenSanPham}</h3>
                <div className="text-base font-black text-blue-600">{formatPrice(selectedDetailProduct.Gia)}</div>
                <p className="text-xs text-slate-500 leading-relaxed pt-2">
                  {selectedDetailProduct.MoTa || 'Sản phẩm Apple phân phối chính hãng bởi DucStore với chính sách bảo hành 1 đổi 1 trong 12 tháng.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    handleAddToCart(selectedDetailProduct);
                    setSelectedDetailProduct(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>Thêm vào giỏ hàng ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4d. Consumer View Return & Warranty Policy Modal */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="customer-policy-modal">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setIsPolicyModalOpen(false)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-4 text-left border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-xs tracking-wider uppercase font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>CHÍNH SÁCH CHẤT LƯỢNG APPLE</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Quy Chế Bảo Hành & Đổi Trả</h2>
              <p className="text-[11px] text-slate-450">Áp dụng cho toàn bộ các dòng iPhone & iPad VN/A được phân phối chính thức tại DucStore.</p>
            </div>

            <div className="overflow-y-auto flex-grow pr-1 space-y-4 text-left max-h-[60vh] scrollbar-thin">
              <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-500/10 flex gap-3 items-start">
                <span className="text-xl">🛡️</span>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase text-blue-800 tracking-wider">HẬU MÃI ĐỒNG HÀNH</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Khách hàng mua sắm tại DucStore được hưởng chế độ 1 đổi 1 trong vòng 30 ngày nếu có lỗi kỹ thuật từ nhà sản xuất, bảo hiểm Applecare toàn quốc 12 tháng.
                  </p>
                </div>
              </div>

              {/* Dynamic rendering with parser */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 shadow-inner">
                {renderPolicyHTML(csBaoHanh)}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4 mt-4">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Cam kết 100% linh kiện chính quy Apple</span>
              </div>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95"
              >
                Đồng ý & Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
