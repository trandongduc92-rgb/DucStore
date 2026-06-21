/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable JSON middleware with generous limit for client uploads or base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Determine correct paths
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const IMAGES_DIR = path.join(process.cwd(), 'wwwroot', 'images');

// Ensure directories exist
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Generate high quality modern SVG images if they do not exist
const seedImages = [
  {
    filename: 'iphone15promax.jpg',
    color: '#8e8d8a',
    title: 'iPhone 15 Pro Max',
    desc: 'Titanium Grey'
  },
  {
    filename: 'iphone15.jpg',
    color: '#93b1a6',
    title: 'iPhone 15',
    desc: 'Soft Green'
  },
  {
    filename: 'iphone14.jpg',
    color: '#ebd3bb',
    title: 'iPhone 14',
    desc: 'Starlight'
  },
  {
    filename: 'ipadpro.jpg',
    color: '#343a40',
    title: 'iPad Pro M4',
    desc: 'Space Black / Tandem OLED'
  },
  {
    filename: 'ipadair.jpg',
    color: '#7209b7',
    title: 'iPad Air M2',
    desc: 'Lilac Blue'
  },
  {
    filename: 'ipad10.jpg',
    color: '#f72585',
    title: 'iPad Gen 10',
    desc: 'Pink Passion'
  }
];

function generateSVGImage(title: string, color: string, desc: string): string {
  const isTablet = title.toLowerCase().includes('ipad');
  const width = isTablet ? 400 : 300;
  const height = isTablet ? 300 : 400;
  const radius = 24;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="appleGrad-${title.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1c1e" />
        <stop offset="60%" stop-color="${color}" />
        <stop offset="100%" stop-color="#2c2c2e" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.5"/>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="#0f172a"/>
    <g transform="translate(${width/2 - (isTablet ? 120 : 90)}, ${height/2 - (isTablet ? 90 : 120)})">
      <!-- Device Chassis -->
      <rect x="0" y="0" width="${isTablet ? 240 : 180}" height="${isTablet ? 180 : 240}" rx="${radius}" fill="url(#appleGrad-${title.replace(/\s+/g, '')})" stroke="#444" stroke-width="3" filter="url(#shadow)"/>
      
      <!-- Screen Inner -->
      <rect x="8" y="8" width="${isTablet ? 224 : 164}" height="${isTablet ? 164 : 224}" rx="${radius - 4}" fill="#000" stroke="#222" stroke-width="1"/>
      
      <!-- Camera details -->
      ${isTablet ? `
        <!-- iPad camera -->
        <circle cx="120" cy="18" r="4" fill="#111" stroke="#222" stroke-width="1"/>
        <circle cx="120" cy="18" r="1.5" fill="#2d6a4f"/>
        <!-- Apple Logo -->
        <path d="M 120 70 C 112 70 109 75 105 75 C 101 75 97 70 91 70 C 83 70 76 77 76 87 C 76 98 83 106 91 106 C 95 106 98 103 101 103 C 104 103 106 106 111 106 C 118 106 124 98 124 90 C 124 88 122 86 120 85 C 116 83 114 79 115 75 C 116 71 119 70 120 70 Z" fill="#ffffff" opacity="0.15" transform="scale(0.8) translate(25, 25)"/>
      ` : `
        <!-- iPhone Dynamic Island -->
        <rect x="62" y="14" width="40" height="8" rx="4" fill="#111"/>
        <circle cx="95" cy="18" r="2.5" fill="#001d3d"/>
        <circle cx="68" cy="18" r="1.5" fill="#03045e"/>
      `}
      
      <!-- Text details on screens -->
      <text x="${isTablet ? 120 : 90}" y="${isTablet ? 110 : 130}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="12" fill="#fff" text-anchor="middle" letter-spacing="1">DUCSTORE</text>
      <text x="${isTablet ? 120 : 90}" y="${isTablet ? 130 : 154}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="300" font-size="10" fill="#a1a1aa" text-anchor="middle">${desc}</text>
    </g>
    
    <!-- Outer Branding -->
    <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#3b82f6" letter-spacing="2">APPLE SERIES</text>
    <rect x="20" y="38" width="40" height="2" fill="#3b82f6" rx="1"/>
  </svg>`;
}

// Write mock images to filesystem for neat loading!
seedImages.forEach(img => {
  const targetPath = path.join(IMAGES_DIR, img.filename);
  if (!fs.existsSync(targetPath)) {
    try {
      const svgContent = generateSVGImage(img.title, img.color, img.desc);
      fs.writeFileSync(targetPath, svgContent);
      console.log(`Successfully generated image: ${img.filename}`);
    } catch (e) {
      console.error(`Failed to write mock image:`, e);
    }
  }
});

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize and label file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|svg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Chỉ chấp nhận file định dạng ảnh (jpeg, jpg, png, gif, svg, webp)!"));
  }
});

// Helper functions to read & write DB cleanly
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database file not found at ${DB_PATH}`);
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Seed sample orders for reporting if empty
    if (!parsed.DonHang || parsed.DonHang.length === 0) {
      parsed.DonHang = [
        {
          "MaDonHang": "dh-17511001",
          "MaKhachHang": "kh-1",
          "TenKhachHang": "Trần Đông Đức",
          "NgayDat": "2026-06-15T10:30:00.000Z",
          "TongTien": 49780000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Hà Nội, Việt Nam"
        },
        {
          "MaDonHang": "dh-17511002",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Nguyễn Văn Hải",
          "NgayDat": "2026-05-20T14:20:00.000Z",
          "TongTien": 29990000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Thủ Đức, TP. Hồ Chí Minh"
        },
        {
          "MaDonHang": "dh-17511003",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Lê Thị Hồng",
          "NgayDat": "2026-05-10T16:45:00.000Z",
          "TongTien": 16990000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Hải Châu, Đà Nẵng"
        },
        {
          "MaDonHang": "dh-17511004",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Phạm Minh Quân",
          "NgayDat": "2026-04-12T09:15:00.000Z",
          "TongTien": 19790000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Ninh Kiều, Cần Thơ"
        },
        {
          "MaDonHang": "dh-17511005",
          "MaKhachHang": "kh-1",
          "TenKhachHang": "Trần Đông Đức",
          "NgayDat": "2026-03-24T11:00:00.000Z",
          "TongTien": 28490000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Hà Nội, Việt Nam"
        },
        {
          "MaDonHang": "dh-17511006",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Đỗ Hoàng Nam",
          "NgayDat": "2026-03-05T15:30:00.000Z",
          "TongTien": 9490000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Vũng Tàu, BR-VT"
        },
        {
          "MaDonHang": "dh-17511007",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Vũ Anh Tuấn",
          "NgayDat": "2026-02-18T14:10:00.000Z",
          "TongTien": 29990000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Hạ Long, Quảng Ninh"
        },
        {
          "MaDonHang": "dh-17511008",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Hoàng Thu Trang",
          "NgayDat": "2026-01-22T10:05:00.000Z",
          "TongTien": 29990000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Hồng Bàng, Hải Phòng"
        },
        {
          "MaDonHang": "dh-17511009",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Phan Thanh Sơn",
          "NgayDat": "2025-11-15T16:20:00.000Z",
          "TongTien": 19790000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Biên Hòa, Đồng Nai"
        },
        {
          "MaDonHang": "dh-17511010",
          "MaKhachHang": "kh-guest",
          "TenKhachHang": "Nguyễn Khánh Linh",
          "NgayDat": "2025-12-20T13:40:00.000Z",
          "TongTien": 58480000,
          "TrangThai": "Đã duyệt",
          "DiaChiGiaoHang": "Hai Bà Trưng, Hà Nội"
        }
      ];
      
      parsed.ChiTietDonHang = [
        { "MaChiTiet": "ct-1", "MaDonHang": "dh-17511001", "MaSanPham": "ip-15-pro-max", "SoLuong": 1, "DonGia": 29990000 },
        { "MaChiTiet": "ct-2", "MaDonHang": "dh-17511001", "MaSanPham": "ip-15", "SoLuong": 1, "DonGia": 19790000 },
        { "MaChiTiet": "ct-3", "MaDonHang": "dh-17511002", "MaSanPham": "ip-15-pro-max", "SoLuong": 1, "DonGia": 29990000 },
        { "MaChiTiet": "ct-4", "MaDonHang": "dh-17511003", "MaSanPham": "ipad-air-m2", "SoLuong": 1, "DonGia": 16990000 },
        { "MaChiTiet": "ct-5", "MaDonHang": "dh-17511004", "MaSanPham": "ip-15", "SoLuong": 1, "DonGia": 19790000 },
        { "MaChiTiet": "ct-6", "MaDonHang": "dh-17511005", "MaSanPham": "ipad-pro-m4", "SoLuong": 1, "DonGia": 28490000 },
        { "MaChiTiet": "ct-7", "MaDonHang": "dh-17511006", "MaSanPham": "ipad-gen-10", "SoLuong": 1, "DonGia": 9490000 },
        { "MaChiTiet": "ct-8", "MaDonHang": "dh-17511007", "MaSanPham": "ip-15-pro-max", "SoLuong": 1, "DonGia": 29990000 },
        { "MaChiTiet": "ct-9", "MaDonHang": "dh-17511008", "MaSanPham": "ip-15-pro-max", "SoLuong": 1, "DonGia": 29990000 },
        { "MaChiTiet": "ct-10", "MaDonHang": "dh-17511009", "MaSanPham": "ip-15", "SoLuong": 1, "DonGia": 19790000 },
        { "MaChiTiet": "ct-11", "MaDonHang": "dh-17511010", "MaSanPham": "ip-15-pro-max", "SoLuong": 1, "DonGia": 29990000 },
        { "MaChiTiet": "ct-12", "MaDonHang": "dh-17511010", "MaSanPham": "ipad-pro-m4", "SoLuong": 1, "DonGia": 28490000 }
      ];
      
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log("Seeded database with historical sales records!");
    }
    
    return parsed;
  } catch (err) {
    console.error("Error reading database, resetting...", err);
    return {
      DanhMuc: [],
      SanPham: [],
      KhachHang: [],
      DonHang: [],
      ChiTietDonHang: [],
      TaiKhoanAdmin: []
    };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing to database:", err);
  }
}

// REST Api Endpoints

// 1. Categories (DanhMuc) - Strictly iPhone and iPad as requested
app.get('/api/danhmuc', (req, res) => {
  const db = readDB();
  // Filter Categories to only keep iPhone and iPad (even if database had others)
  const allowed = ['iphone', 'ipad'];
  const filtered = db.DanhMuc.filter((dm: any) => allowed.includes(dm.MaDanhMuc.toLowerCase()));
  res.json(filtered);
});

// 2. Products (SanPham)
app.get('/api/sanpham', (req, res) => {
  const db = readDB();
  // Also filter out any products belonging to unauthorized categories dynamically
  const allowed = ['iphone', 'ipad'];
  const filtered = db.SanPham.filter((sp: any) => allowed.includes(sp.MaDanhMuc.toLowerCase()));
  res.json(filtered);
});

// 2a. Add Product (Thêm sản phẩm) - AdminController Mocking
app.post('/api/sanpham', upload.single('hinhAnhFile'), (req, res) => {
  try {
    const db = readDB();
    const { TenSanPham, Gia, MoTa, MaDanhMuc } = req.body;
    
    // Validations
    if (!TenSanPham || !Gia || !MaDanhMuc) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc (Tên, Giá, Danh mục)!" });
    }
    
    // Category check: Only iPhone or iPad is allowed!
    const allowed = ['iphone', 'ipad'];
    if (!allowed.includes(MaDanhMuc.toLowerCase())) {
      return res.status(400).json({ error: "Chỉ được chọn danh mục iPhone hoặc iPad!" });
    }
    
    // Image Handling
    let filename = 'default_apple.jpg';
    if (req.file) {
      filename = req.file.filename;
    } else if (req.body.HinhAnh) {
      filename = req.body.HinhAnh;
    }
    
    // Auto-create product ID
    const newId = `sp-${Date.now()}`;
    const priceNum = parseFloat(Gia);
    
    const newProduct = {
      MaSanPham: newId,
      TenSanPham,
      Gia: isNaN(priceNum) ? 0 : priceNum,
      MoTa: MoTa || '',
      MaDanhMuc: MaDanhMuc.toLowerCase(),
      HinhAnh: filename
    };
    
    db.SanPham.push(newProduct);
    writeDB(db);
    
    res.status(201).json({ message: "Thêm sản phẩm thành công!", data: newProduct });
  } catch (error: any) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ error: error.message || "Lỗi máy chủ trong quá trình tạo sản phẩm!" });
  }
});

// 2b. Edit Product (Sửa sản phẩm) - Controllers/AdminController.cs Rules
app.put('/api/sanpham/:id', upload.single('hinhAnhFile'), (req, res) => {
  try {
    const db = readDB();
    const maSanPham = req.params.id;
    const { TenSanPham, Gia, MoTa, MaDanhMuc } = req.body;
    
    // Find absolute old product to update field by field
    const productIdx = db.SanPham.findIndex((sp: any) => sp.MaSanPham === maSanPham);
    if (productIdx === -1) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm cần cập nhật!" });
    }
    
    const oldProduct = db.SanPham[productIdx];
    
    // Category check
    const allowed = ['iphone', 'ipad'];
    if (MaDanhMuc && !allowed.includes(MaDanhMuc.toLowerCase())) {
      return res.status(400).json({ error: "Chỉ được chọn danh mục iPhone hoặc iPad!" });
    }
    
    // Update individual fields
    if (TenSanPham !== undefined) oldProduct.TenSanPham = TenSanPham;
    if (Gia !== undefined) {
      const priceNum = parseFloat(Gia);
      oldProduct.Gia = isNaN(priceNum) ? oldProduct.Gia : priceNum;
    }
    if (MoTa !== undefined) oldProduct.MoTa = MoTa;
    if (MaDanhMuc !== undefined) oldProduct.MaDanhMuc = MaDanhMuc.toLowerCase();
    
    // Upload image rule: If admin does not upload a new image, keep the old filename
    if (req.file) {
      oldProduct.HinhAnh = req.file.filename;
    } else {
      // keep original oldProduct.HinhAnh intact
      console.log(`Admin unmodified HinhAnh for ${maSanPham}, preserving: ${oldProduct.HinhAnh}`);
    }
    
    db.SanPham[productIdx] = oldProduct;
    writeDB(db);
    
    res.json({ message: "Cập nhật sản phẩm thành công!", data: oldProduct });
  } catch (error: any) {
    console.error("Lỗi khi sửa sản phẩm:", error);
    res.status(500).json({ error: error.message || "Lỗi máy chủ khi cập nhật sản phẩm!" });
  }
});

// 2c. Delete Product (Xóa sản phẩm)
app.delete('/api/sanpham/:id', (req, res) => {
  try {
    const db = readDB();
    const id = req.params.id;
    const initialLength = db.SanPham.length;
    db.SanPham = db.SanPham.filter((sp: any) => sp.MaSanPham !== id);
    
    if (db.SanPham.length === initialLength) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm để xóa!" });
    }
    
    writeDB(db);
    res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Customers Auth: Login & Register (KhachHang & TaiKhoanAdmin)
app.post('/api/auth/register', (req, res) => {
  const db = readDB();
  const { Email, MatKhau, TenKhachHang, DienThoai, DiaChi } = req.body;
  
  if (!Email || !MatKhau || !TenKhachHang) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ Email, Mật khẩu và Tên khách hàng!" });
  }
  
  const existing = db.KhachHang.find((kh: any) => kh.Email.toLowerCase() === Email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email này đã được đăng ký trên hệ thống!" });
  }
  
  const newId = `kh-${Date.now()}`;
  const newCustomer = {
    MaKhachHang: newId,
    TenKhachHang,
    Email,
    MatKhau,
    DienThoai: DienThoai || '',
    DiaChi: DiaChi || ''
  };
  
  db.KhachHang.push(newCustomer);
  writeDB(db);
  
  // Return info without password
  const { MatKhau: _, ...userWithoutPass } = newCustomer;
  res.status(201).json({ message: "Đăng ký tài khoản thành công!", user: userWithoutPass, role: 'customer' });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { Username, Password } = req.body; // Can support email (customer) or username (admin)
  
  if (!Username || !Password) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" });
  }
  
  // Try login as Admin
  const adminAcc = db.TaiKhoanAdmin.find((adm: any) => adm.TenDangNhap.toLowerCase() === Username.toLowerCase().trim() && adm.MatKhau === Password);
  if (adminAcc) {
    return res.json({
      message: "Đăng nhập hệ thống Quản trị viên thành công!",
      user: {
        TenDangNhap: adminAcc.TenDangNhap,
        HoTen: adminAcc.HoTen
      },
      role: 'admin'
    });
  }
  
  // Try login as Customer (KhachHang)
  const customerAcc = db.KhachHang.find((kh: any) => kh.Email.toLowerCase() === Username.toLowerCase().trim() && kh.MatKhau === Password);
  if (customerAcc) {
    const { MatKhau: _, ...userWithoutPass } = customerAcc;
    return res.json({
      message: "Đăng nhập thành công!",
      user: userWithoutPass,
      role: 'customer'
    });
  }
  
  res.status(401).json({ error: "Tên đăng nhập, email hoặc mật khẩu không chính xác!" });
});

// 4. Cart Checkout: Order (DonHang & ChiTietDonHang)
app.post('/api/checkout', (req, res) => {
  try {
    const db = readDB();
    const { MaKhachHang, TenKhachHang, DiaChiGiaoHang, CartItems } = req.body;
    
    if (!CartItems || CartItems.length === 0) {
      return res.status(400).json({ error: "Giỏ hàng rỗng, không thể đặt hàng!" });
    }
    
    if (!DiaChiGiaoHang) {
      return res.status(400).json({ error: "Vui lòng điền thông tin địa chỉ giao hàng!" });
    }
    
    const newOrderId = `dh-${Date.now()}`;
    let tongTien = 0;
    
    // Create order details
    const details = CartItems.map((item: any, idx: number) => {
      const sp = db.SanPham.find((s: any) => s.MaSanPham === item.SanPham.MaSanPham);
      const donGia = sp ? sp.Gia : item.SanPham.Gia;
      const amount = item.SoLuong || 1;
      tongTien += donGia * amount;
      
      return {
        MaChiTiet: `ctdh-${Date.now()}-${idx}`,
        MaDonHang: newOrderId,
        MaSanPham: item.SanPham.MaSanPham,
        SoLuong: amount,
        DonGia: donGia
      };
    });
    
    const newOrder = {
      MaDonHang: newOrderId,
      MaKhachHang: MaKhachHang || 'kh-guest',
      TenKhachHang: TenKhachHang || 'Khách đặt qua Web',
      NgayDat: new Date().toISOString(),
      TongTien: tongTien,
      TrangThai: 'Chờ duyệt',
      DiaChiGiaoHang
    };
    
    // Save to DB lists
    db.DonHang.push(newOrder);
    db.ChiTietDonHang.push(...details);
    writeDB(db);
    
    res.status(201).json({ message: "Đặt hàng thành công!", orderId: newOrderId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer orders or system orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  const customerId = req.query.maKhachHang;
  
  if (customerId) {
    const customerOrders = db.DonHang.filter((dh: any) => dh.MaKhachHang === customerId);
    return res.json(customerOrders);
  }
  
  res.json(db.DonHang);
});

// Update Order status (for Admin)
app.patch('/api/orders/:id', (req, res) => {
  const db = readDB();
  const orderId = req.params.id;
  const { TrangThai } = req.body;
  
  const orderIdx = db.DonHang.findIndex((dh: any) => dh.MaDonHang === orderId);
  if (orderIdx === -1) {
    return res.status(404).json({ error: "Không tìm thấy đơn hàng!" });
  }
  
  db.DonHang[orderIdx].TrangThai = TrangThai;
  writeDB(db);
  res.json({ message: "Cập nhật trạng thái đơn hàng thành công!", data: db.DonHang[orderIdx] });
});

// Static files routing after endpoint definition
app.get('/images/:filename', (req, res, next) => {
  const filePath = path.join(IMAGES_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const utf8String = fileContent.toString().trim();
      if (utf8String.startsWith('<svg') || utf8String.startsWith('<?xml') || utf8String.includes('xmlns="http://www.w3.org/2000/svg"')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else {
        // Fallback to auto extension mime-type detection for actual uploaded binary images
        const ext = path.extname(req.params.filename).toLowerCase();
        if (ext === '.png') res.setHeader('Content-Type', 'image/png');
        else if (ext === '.gif') res.setHeader('Content-Type', 'image/gif');
        else if (ext === '.webp') res.setHeader('Content-Type', 'image/webp');
        else if (ext === '.svg') res.setHeader('Content-Type', 'image/svg+xml');
        else res.setHeader('Content-Type', 'image/jpeg');
      }
      return res.send(fileContent);
    } catch (e) {
      console.error("Error serving image", e);
    }
  }
  next();
});
app.use('/images', express.static(IMAGES_DIR));

// Setup Vite development server or production build static folder
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development backend in integration mode with Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving build outputs statically and resolving client-side routes...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booted! Running successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
