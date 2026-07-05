-- ==========================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU DUCSTORE
-- SỬ DỤNG CHO MICROSOFT SQL SERVER
-- ==========================================

-- 1. Tạo database (Nếu chưa có)
-- Chạy lệnh dưới đây trước, hoặc tạo tay database tên "DucStore" rồi chọn để chạy tiếp
-- CREATE DATABASE DucStore;
-- GO
-- USE DucStore;
-- GO

-- Xóa các bảng nếu đã tồn tại để tránh xung đột dữ liệu (Xóa theo thứ tự từ phụ tới chính)
IF OBJECT_ID('ChiTietDonHang', 'U') IS NOT NULL DROP TABLE ChiTietDonHang;
IF OBJECT_ID('DonHang', 'U') IS NOT NULL DROP TABLE DonHang;
IF OBJECT_ID('SanPham', 'U') IS NOT NULL DROP TABLE SanPham;
IF OBJECT_ID('DanhMuc', 'U') IS NOT NULL DROP TABLE DanhMuc;
IF OBJECT_ID('KhachHang', 'U') IS NOT NULL DROP TABLE KhachHang;
IF OBJECT_ID('TaiKhoanAdmin', 'U') IS NOT NULL DROP TABLE TaiKhoanAdmin;
GO

-- 2. Tạo bảng danh mục
CREATE TABLE DanhMuc (
    MaDanhMuc VARCHAR(50) PRIMARY KEY,
    TenDanhMuc NVARCHAR(100) NOT NULL
);
GO

-- 3. Tạo bảng sản phẩm
CREATE TABLE SanPham (
    MaSanPham VARCHAR(50) PRIMARY KEY,
    TenSanPham NVARCHAR(250) NOT NULL,
    Gia DECIMAL(18, 2) NOT NULL,
    MoTa NVARCHAR(MAX) NULL,
    MaDanhMuc VARCHAR(50) NOT NULL,
    HinhAnh VARCHAR(250) NULL,
    CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc)
);
GO

-- 4. Tạo bảng khách hàng
CREATE TABLE KhachHang (
    MaKhachHang VARCHAR(50) PRIMARY KEY,
    TenKhachHang NVARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    MatKhau VARCHAR(100) NOT NULL,
    DienThoai VARCHAR(20) NULL,
    DiaChi NVARCHAR(250) NULL
);
GO

-- 5. Tạo bảng đơn hàng
CREATE TABLE DonHang (
    MaDonHang VARCHAR(50) PRIMARY KEY,
    MaKhachHang VARCHAR(50) NULL,
    TenKhachHang NVARCHAR(150) NOT NULL,
    NgayDat DATETIME NOT NULL DEFAULT GETDATE(),
    TongTien DECIMAL(18, 2) NOT NULL,
    TrangThai NVARCHAR(50) NOT NULL DEFAULT N'Chờ duyệt', -- "Chờ duyệt", "Đã duyệt", "Đã giao", "Đã hủy"
    DiaChiGiaoHang NVARCHAR(250) NOT NULL,
    CONSTRAINT FK_DonHang_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang) ON DELETE SET NULL
);
GO

-- 6. Tạo bảng chi tiết đơn hàng
CREATE TABLE ChiTietDonHang (
    MaChiTiet VARCHAR(50) PRIMARY KEY,
    MaDonHang VARCHAR(50) NOT NULL,
    MaSanPham VARCHAR(50) NOT NULL,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(18, 2) NOT NULL,
    CONSTRAINT FK_ChiTiet_DonHang FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTiet_SanPham FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);
GO

-- 7. Tạo bảng tài khoản quản trị
CREATE TABLE TaiKhoanAdmin (
    TenDangNhap VARCHAR(50) PRIMARY KEY,
    MatKhau VARCHAR(100) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL
);
GO


-- =======================================================
-- 8. SEED DATA (CHÈN DỮ LIỆU ĐANG CÓ TRÊN ĐÁM MÂY VÀO SQL SERVER)
-- =======================================================

-- Chèn Danh mục
INSERT INTO DanhMuc (MaDanhMuc, TenDanhMuc) VALUES 
('iphone', N'iPhone'),
('ipad', N'iPad');
GO

-- Chèn Sản phẩm
INSERT INTO SanPham (MaSanPham, TenSanPham, Gia, MoTa, MaDanhMuc, HinhAnh) VALUES 
('ip-15-pro-max', N'iPhone 15 Pro Max 256GB', 29990000, N'iPhone mạnh mẽ nhất thế giới với khung viền titan siêu nhẹ, nút Tác vụ thông minh, vi xử lý A17 Pro và camera thu phóng 5x hoàn hảo.', 'iphone', 'iphone15promax.jpg'),
('ip-15', N'iPhone 15 128GB', 19790000, N'Sở hữu Dynamic Island đột phá, mặt lưng kính pha màu tinh tế, sạc cổng USB-C tiện dụng cùng hệ thống camera chính 48MP.', 'iphone', 'iphone15.jpg'),
('ip-14', N'iPhone 14 128GB', 16490000, N'Hiệu năng bền bỉ vượt trội từ chip A15 Bionic cải tiến, hệ thống camera chụp đêm ấn tượng và pin lâu dài.', 'iphone', 'iphone14.jpg'),
('ipad-pro-m4', N'iPad Pro M4 11 inch Wi-Fi 256GB', 28490000, N'Mỏng nhẹ đột phá kết hợp chip M4 cực mạnh, đi kèm màn hình Tandem OLED Ultra Retina XDR siêu thực.', 'ipad', 'ipadpro.jpg'),
('ipad-air-m2', N'iPad Air M2 11 inch Wi-Fi 128GB', 16990000, N'Trang bị sức mạnh của dòng chip Apple M2 chuyên nghiệp, camera FaceTime 12MP nằm ngang cân đối.', 'ipad', 'ipadair.jpg'),
('ipad-gen-10', N'iPad 10.9 inch Gen 10 Wi-Fi 64GB', 9490000, N'Diện mạo trẻ trung cá tính với màn hình tràn cạnh sắc màu rực rỡ, chip A14 Bionic nhanh nhẹn.', 'ipad', 'ipad10.jpg');
GO

-- Chèn Khách hàng mẫu
INSERT INTO KhachHang (MaKhachHang, TenKhachHang, Email, MatKhau, DienThoai, DiaChi) VALUES
('kh-1', N'Trần Đông Đức', 'trandongduc92@gmail.com', '123456', '0987654321', N'Hà Nội, Việt Nam');
GO

-- Chèn Tài khoản Admin
INSERT INTO TaiKhoanAdmin (TenDangNhap, MatKhau, HoTen) VALUES
('admin', 'admin123', N'Đức Admin');
GO

-- Chèn Đơn hàng mẫu
INSERT INTO DonHang (MaDonHang, MaKhachHang, TenKhachHang, NgayDat, TongTien, TrangThai, DiaChiGiaoHang) VALUES
('dh-17511001', 'kh-1', N'Trần Đông Đức', '2026-06-15 10:30:00', 49780000, N'Đã duyệt', N'Hà Nội, Việt Nam');
GO

-- Chèn Chi tiết đơn hàng mẫu
INSERT INTO ChiTietDonHang (MaChiTiet, MaDonHang, MaSanPham, SoLuong, DonGia) VALUES
('ct-1', 'dh-17511001', 'ip-15-pro-max', 1, 29990000),
('ct-2', 'dh-17511001', 'ip-15', 1, 19790000);
GO
