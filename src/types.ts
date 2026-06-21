/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DanhMuc {
  MaDanhMuc: string; // 'iphone' or 'ipad'
  TenDanhMuc: string; // 'iPhone' or 'iPad'
}

export interface SanPham {
  MaSanPham: string;
  TenSanPham: string;
  Gia: number;
  MoTa: string;
  MaDanhMuc: string; // 'iphone' or 'ipad'
  HinhAnh: string; // File name (e.g. 'iphone14.jpg') or URL
}

export interface KhachHang {
  MaKhachHang: string;
  TenKhachHang: string;
  Email: string;
  MatKhau: string;
  DienThoai?: string;
  DiaChi?: string;
}

export interface DonHang {
  MaDonHang: string;
  MaKhachHang: string;
  TenKhachHang: string; // Saved for easy display
  NgayDat: string;
  TongTien: number;
  TrangThai: 'Chờ duyệt' | 'Đã duyệt' | 'Đang giao' | 'Đã giao' | 'Đã hủy';
  DiaChiGiaoHang: string;
}

export interface ChiTietDonHang {
  MaChiTiet: string;
  MaDonHang: string;
  MaSanPham: string;
  SoLuong: number;
  DonGia: number;
}

export interface TaiKhoanAdmin {
  TenDangNhap: string;
  MatKhau: string;
  HoTen: string;
}

export interface GioHangItem {
  SanPham: SanPham;
  SoLuong: number;
}
