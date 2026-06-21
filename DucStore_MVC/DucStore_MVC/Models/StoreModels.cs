using System;
using System.Collections.Generic;

namespace DucStore_MVC.Models
{
    public class DanhMuc
    {
        public string MaDanhMuc { get; set; } = string.Empty;
        public string TenDanhMuc { get; set; } = string.Empty;
    }

    public class SanPham
    {
        public string MaSanPham { get; set; } = string.Empty;
        public string TenSanPham { get; set; } = string.Empty;
        public decimal Gia { get; set; }
        public string MoTa { get; set; } = string.Empty;
        public string MaDanhMuc { get; set; } = string.Empty;
        public string HinhAnh { get; set; } = string.Empty;
    }

    public class KhachHang
    {
        public string MaKhachHang { get; set; } = string.Empty;
        public string TenKhachHang { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
    }

    public class DonHang
    {
        public string MaDonHang { get; set; } = string.Empty;
        public string MaKhachHang { get; set; } = string.Empty;
        public string TenKhachHang { get; set; } = string.Empty;
        public DateTime NgayDat { get; set; } = DateTime.Now;
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = "Chờ duyệt"; // "Chờ duyệt", "Đã duyệt", "Đã giao", "Đã hủy"
        public string DiaChiGiaoHang { get; set; } = string.Empty;
    }

    public class ChiTietDonHang
    {
        public string MaChiTiet { get; set; } = string.Empty;
        public string MaDonHang { get; set; } = string.Empty;
        public string MaSanPham { get; set; } = string.Empty;
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }
    }

    public class TaiKhoanAdmin
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
    }

    public class FullDatabase
    {
        public List<DanhMuc> DanhMuc { get; set; } = new();
        public List<SanPham> SanPham { get; set; } = new();
        public List<KhachHang> KhachHang { get; set; } = new();
        public List<DonHang> DonHang { get; set; } = new();
        public List<ChiTietDonHang> ChiTietDonHang { get; set; } = new();
        public List<TaiKhoanAdmin> TaiKhoanAdmin { get; set; } = new();
    }

    // Model for Cart Item in Session
    public class CartItem
    {
        public SanPham SanPham { get; set; } = new();
        public int SoLuong { get; set; }
        public decimal ThanhTien => SanPham.Gia * SoLuong;
    }
}
