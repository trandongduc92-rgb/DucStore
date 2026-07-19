using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using DucStore_MVC.Models;
using DucStore_MVC.Data;

namespace DucStore_MVC.Services
{
    public interface IDbService
    {
        Task<FullDatabase> GetDatabaseAsync();
        Task SaveDatabaseAsync(FullDatabase db);
    }

    public class DbService : IDbService
    {
        private readonly string _filePath;
        private readonly string _imagesPath;
        private static readonly object _lock = new();
        private readonly IServiceProvider _serviceProvider;
        private readonly bool _useSqlServer;

        public DbService(IWebHostEnvironment env, IServiceProvider serviceProvider, IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _filePath = Path.Combine(env.ContentRootPath, "Data", "db.json");
            _imagesPath = Path.Combine(env.WebRootPath, "images");


            var connStr = configuration.GetConnectionString("DefaultConnection");
            _useSqlServer = !string.IsNullOrEmpty(connStr);


            var dir = Path.GetDirectoryName(_filePath);
            if (dir != null && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            if (!Directory.Exists(_imagesPath))
            {
                Directory.CreateDirectory(_imagesPath);
            }

            if (!_useSqlServer)
            {
                SeedDefaultData();
            }
        }

        public async Task<FullDatabase> GetDatabaseAsync()
        {
            if (_useSqlServer)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var db = new FullDatabase
                        {
                            DanhMuc = await context.DanhMuc.AsNoTracking().ToListAsync(),
                            SanPham = await context.SanPham.AsNoTracking().ToListAsync(),
                            KhachHang = await context.KhachHang.AsNoTracking().ToListAsync(),
                            DonHang = await context.DonHang.AsNoTracking().ToListAsync(),
                            ChiTietDonHang = await context.ChiTietDonHang.AsNoTracking().ToListAsync(),
                            TaiKhoanAdmin = await context.TaiKhoanAdmin.AsNoTracking().ToListAsync()
                        };
                        return db;
                    }
                }
                catch (Exception ex)
                {

                    throw new Exception("Không kết nối được SQL Server. Project đang bắt buộc dùng SQL, không dùng db.json nữa.", ex);
                }

            }


            if (!File.Exists(_filePath))
            {
                return new FullDatabase();
            }

            try
            {
                string jsonString;
                lock (_lock)
                {
                    jsonString = File.ReadAllText(_filePath);
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var db = JsonSerializer.Deserialize<FullDatabase>(jsonString, options);
                return db ?? new FullDatabase();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading database: {ex.Message}");
                return new FullDatabase();
            }
        }

        public async Task SaveDatabaseAsync(FullDatabase db)
        {
            if (_useSqlServer)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();


                        var existingDanhMuc = await context.DanhMuc.ToListAsync();
                        foreach (var item in db.DanhMuc)
                        {
                            var existing = existingDanhMuc.FirstOrDefault(d => d.MaDanhMuc == item.MaDanhMuc);
                            if (existing == null) context.DanhMuc.Add(item);
                            else context.Entry(existing).CurrentValues.SetValues(item);
                        }
                        foreach (var existing in existingDanhMuc)
                        {
                            if (!db.DanhMuc.Any(d => d.MaDanhMuc == existing.MaDanhMuc))
                                context.DanhMuc.Remove(existing);
                        }


                        var existingSanPham = await context.SanPham.ToListAsync();
                        foreach (var item in db.SanPham)
                        {
                            var existing = existingSanPham.FirstOrDefault(s => s.MaSanPham == item.MaSanPham);
                            if (existing == null) context.SanPham.Add(item);
                            else context.Entry(existing).CurrentValues.SetValues(item);
                        }
                        foreach (var existing in existingSanPham)
                        {
                            if (!db.SanPham.Any(s => s.MaSanPham == existing.MaSanPham))
                                context.SanPham.Remove(existing);
                        }


                        var existingKhachHang = await context.KhachHang.ToListAsync();
                        foreach (var item in db.KhachHang)
                        {
                            var existing = existingKhachHang.FirstOrDefault(k => k.MaKhachHang == item.MaKhachHang);
                            if (existing == null) context.KhachHang.Add(item);
                            else context.Entry(existing).CurrentValues.SetValues(item);
                        }
                        foreach (var existing in existingKhachHang)
                        {
                            if (!db.KhachHang.Any(k => k.MaKhachHang == existing.MaKhachHang))
                                context.KhachHang.Remove(existing);
                        }


                        var existingDonHang = await context.DonHang.ToListAsync();
                        foreach (var item in db.DonHang)
                        {
                            var existing = existingDonHang.FirstOrDefault(d => d.MaDonHang == item.MaDonHang);
                            if (existing == null) context.DonHang.Add(item);
                            else context.Entry(existing).CurrentValues.SetValues(item);
                        }
                        foreach (var existing in existingDonHang)
                        {
                            if (!db.DonHang.Any(d => d.MaDonHang == existing.MaDonHang))
                                context.DonHang.Remove(existing);
                        }


                        var existingChiTiet = await context.ChiTietDonHang.ToListAsync();
                        foreach (var item in db.ChiTietDonHang)
                        {
                            var existing = existingChiTiet.FirstOrDefault(c => c.MaChiTiet == item.MaChiTiet);
                            if (existing == null) context.ChiTietDonHang.Add(item);
                            else context.Entry(existing).CurrentValues.SetValues(item);
                        }
                        foreach (var existing in existingChiTiet)
                        {
                            if (!db.ChiTietDonHang.Any(c => c.MaChiTiet == existing.MaChiTiet))
                                context.ChiTietDonHang.Remove(existing);
                        }


                        var existingAdmin = await context.TaiKhoanAdmin.ToListAsync();
                        foreach (var item in db.TaiKhoanAdmin)
                        {
                            var existing = existingAdmin.FirstOrDefault(a => a.TenDangNhap == item.TenDangNhap);
                            if (existing == null) context.TaiKhoanAdmin.Add(item);
                            else context.Entry(existing).CurrentValues.SetValues(item);
                        }
                        foreach (var existing in existingAdmin)
                        {
                            if (!db.TaiKhoanAdmin.Any(a => a.TenDangNhap == existing.TenDangNhap))
                                context.TaiKhoanAdmin.Remove(existing);
                        }

                        await context.SaveChangesAsync();
                        return;
                    }
                }
                catch (Exception ex)
                {

                    throw new Exception("Không lưu được vào SQL Server. Project đang bắt buộc dùng SQL, không dùng db.json nữa.", ex);
                }
            }


            try
            {
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true
                };
                string jsonString = JsonSerializer.Serialize(db, options);

                lock (_lock)
                {
                    File.WriteAllText(_filePath, jsonString);
                }
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing database: {ex.Message}");
            }
        }

        private void SeedDefaultData()
        {
            if (!File.Exists(_filePath))
            {
                var defaultDb = new FullDatabase
                {
                    DanhMuc = new()
                    {
                        new DanhMuc { MaDanhMuc = "iphone", TenDanhMuc = "iPhone" },
                        new DanhMuc { MaDanhMuc = "ipad", TenDanhMuc = "iPad" }
                    },
                    SanPham = new()
                    {
                        new SanPham { MaSanPham = "ip-15-pro-max", TenSanPham = "iPhone 15 Pro Max 256GB", Gia = 29990000, MoTa = "iPhone mạnh mẽ nhất thế giới với khung viền titan siêu nhẹ, nút Tác vụ thông minh, vi xử lý A17 Pro và camera thu phóng 5x hoàn hảo.", MaDanhMuc = "iphone", HinhAnh = "iphone15promax.jpg" },
                        new SanPham { MaSanPham = "ip-15", TenSanPham = "iPhone 15 128GB", Gia = 19790000, MoTa = "Sở hữu Dynamic Island đột phá, mặt lưng kính pha màu tinh tế, sạc cổng USB-C tiện dụng cùng hệ thống camera chính 48MP.", MaDanhMuc = "iphone", HinhAnh = "iphone15.jpg" },
                        new SanPham { MaSanPham = "ip-14", TenSanPham = "iPhone 14 128GB", Gia = 16490000, MoTa = "Hiệu năng bền bỉ vượt trội từ chip A15 Bionic cải tiến, hệ thống camera chụp đêm ấn tượng và pin lâu dài.", MaDanhMuc = "iphone", HinhAnh = "iphone14.jpg" },
                        new SanPham { MaSanPham = "ipad-pro-m4", TenSanPham = "iPad Pro M4 11 inch Wi-Fi 256GB", Gia = 28490000, MoTa = "Mỏng nhẹ đột phá kết hợp chip M4 cực mạnh, đi kèm màn hình Tandem OLED Ultra Retina XDR siêu thực.", MaDanhMuc = "ipad", HinhAnh = "ipadpro.jpg" },
                        new SanPham { MaSanPham = "ipad-air-m2", TenSanPham = "iPad Air M2 11 inch Wi-Fi 128GB", Gia = 16990000, MoTa = "Trang bị sức mạnh của dòng chip Apple M2 chuyên nghiệp, camera FaceTime 12MP nằm ngang cân đối.", MaDanhMuc = "ipad", HinhAnh = "ipadair.jpg" },
                        new SanPham { MaSanPham = "ipad-gen-10", TenSanPham = "iPad 10.9 inch Gen 10 Wi-Fi 64GB", Gia = 9490000, MoTa = "Diện mạo trẻ trung cá tính với màn hình tràn cạnh sắc màu rực rỡ, chip A14 Bionic nhanh nhẹn.", MaDanhMuc = "ipad", HinhAnh = "ipad10.jpg" }
                    },
                    KhachHang = new()
                    {
                        new KhachHang { MaKhachHang = "kh-1", TenKhachHang = "Trần Đông Đức", Email = "trandongduc92@gmail.com", MatKhau = "123456", DienThoai = "0987654321", DiaChi = "Hà Nội, Việt Nam" }
                    },
                    DonHang = new()
                    {
                        new DonHang { MaDonHang = "dh-17511001", MaKhachHang = "kh-1", TenKhachHang = "Trần Đông Đức", NgayDat = DateTime.Parse("2026-06-15T10:30:00"), TongTien = 49780000, TrangThai = "Đã duyệt", DiaChiGiaoHang = "Hà Nội, Việt Nam" }
                    },
                    ChiTietDonHang = new()
                    {
                        new ChiTietDonHang { MaChiTiet = "ct-1", MaDonHang = "dh-17511001", MaSanPham = "ip-15-pro-max", SoLuong = 1, DonGia = 29990000 },
                        new ChiTietDonHang { MaChiTiet = "ct-2", MaDonHang = "dh-17511001", MaSanPham = "ip-15", SoLuong = 1, DonGia = 19790000 }
                    },
                    TaiKhoanAdmin = new()
                    {
                        new TaiKhoanAdmin { TenDangNhap = "ducadmin", MatKhau = "DucStore@2026!", HoTen = "Đức Admin" }
                    }
                };

                var options = new JsonSerializerOptions { WriteIndented = true };
                string jsonString = JsonSerializer.Serialize(defaultDb, options);
                File.WriteAllText(_filePath, jsonString);
            }
        }
    }
}