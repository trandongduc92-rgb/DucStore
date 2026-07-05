using Microsoft.AspNetCore.Mvc;
using DucStore_MVC.Services;
using DucStore_MVC.Models;
using System.Text.Json;

namespace DucStore_MVC.Controllers
{
    public class AdminController : Controller
    {
        private readonly IDbService _dbService;

        public AdminController(IDbService dbService)
        {
            _dbService = dbService;
        }

        private bool IsAdminAuthenticated()
        {
            return HttpContext.Session.GetString("Admin") != null;
        }

        public async Task<IActionResult> Index()
        {
            if (!IsAdminAuthenticated())
            {
                TempData["ErrorMessage"] = "Bạn phải đăng nhập quyền Admin để tiếp tục!";
                return RedirectToAction("Index", "Home");
            }

            var db = await _dbService.GetDatabaseAsync();

            // Calculate Statistics
            // Calculate Statistics
            ViewBag.TotalProducts = db.SanPham.Count;

            // Tổng số hóa đơn
            ViewBag.TotalOrders = db.DonHang.Count;

            // Hóa đơn đang chờ duyệt
            ViewBag.PendingOrders = db.DonHang.Count(d =>
    d.TrangThai != null &&
    (
        d.TrangThai.Trim().ToLower() == "chờ duyệt" ||
        d.TrangThai.Trim().ToLower() == "chờ xác nhận thanh toán"
    )
);

            // Tổng số khách hàng / thành viên đăng ký
            // Tổng số khách hàng / thành viên đăng ký
            ViewBag.TotalCustomers = db.KhachHang.Count;

            // Danh sách thành viên / khách hàng
            ViewBag.Customers = db.KhachHang
                .OrderByDescending(k => k.MaKhachHang)
                .ToList();

            // Tổng doanh thu chỉ tính đơn đã duyệt hoặc đã giao
            ViewBag.TotalRevenue = db.DonHang
                .Where(d =>
                    d.TrangThai != null &&
                    (
                        d.TrangThai.Trim().ToLower() == "đã duyệt" ||
                        d.TrangThai.Trim().ToLower() == "đã giao"
                    )
                )
                .Sum(d => d.TongTien);
            // Dữ liệu hiển thị cho Dashboard
            ViewBag.RecentOrders = db.DonHang
                .OrderByDescending(d => d.NgayDat)
                .Take(5)
                .ToList();

            ViewBag.Categories = db.DanhMuc;

            ViewBag.Products = db.SanPham;

            ViewBag.Orders = db.DonHang
                .OrderByDescending(d => d.NgayDat)
                .ToList();
            var adminJson = HttpContext.Session.GetString("Admin");
            if (adminJson != null)
            {
                ViewBag.CurrentAdmin = JsonSerializer.Deserialize<TaiKhoanAdmin>(adminJson);
            }

            return View();
        }

        // --- MANAGING PRODUCTS ---

        [HttpPost]
        public async Task<IActionResult> AddProduct(string code, string name, decimal price, string description, string categoryCode, IFormFile? imageFile)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();

            if (db.SanPham.Any(p => p.MaSanPham == code))
            {
                TempData["ErrorMessage"] = "Mã sản phẩm đã tồn tại!";
                return RedirectToAction("Index");
            }

            string imageName = "iphone15.jpg"; // Default
            if (imageFile != null && imageFile.Length > 0)
            {
                imageName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", imageName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }
            }

            var newProduct = new SanPham
            {
                MaSanPham = code,
                TenSanPham = name,
                Gia = price,
                MoTa = description,
                MaDanhMuc = categoryCode,
                HinhAnh = imageName
            };

            db.SanPham.Add(newProduct);
            await _dbService.SaveDatabaseAsync(db);

            TempData["SuccessMessage"] = "Thêm sản phẩm mới thành công!";
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> EditProduct(string code, string name, decimal price, string description, string categoryCode, IFormFile? imageFile)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();
            var target = db.SanPham.FirstOrDefault(p => p.MaSanPham == code);

            if (target != null)
            {
                target.TenSanPham = name;
                target.Gia = price;
                target.MoTa = description;
                target.MaDanhMuc = categoryCode;

                if (imageFile != null && imageFile.Length > 0)
                {
                    string imageName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                    string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", imageName);
                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }
                    target.HinhAnh = imageName;
                }

                await _dbService.SaveDatabaseAsync(db);
                TempData["SuccessMessage"] = "Cập nhật sản phẩm thành công!";
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> DeleteProduct(string code)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();
            var target = db.SanPham.FirstOrDefault(p => p.MaSanPham == code);

            if (target != null)
            {
                db.SanPham.Remove(target);
                await _dbService.SaveDatabaseAsync(db);
                TempData["SuccessMessage"] = "Đã xóa sản phẩm khỏi hệ thống!";
            }

            return RedirectToAction("Index");
        }

        // --- MANAGING CATEGORIES ---

        [HttpPost]
        public async Task<IActionResult> AddCategory(string code, string name)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();

            if (db.DanhMuc.Any(d => d.MaDanhMuc == code))
            {
                TempData["ErrorMessage"] = "Mã danh mục đã tồn tại!";
                return RedirectToAction("Index");
            }

            db.DanhMuc.Add(new DanhMuc { MaDanhMuc = code, TenDanhMuc = name });
            await _dbService.SaveDatabaseAsync(db);

            TempData["SuccessMessage"] = "Thêm danh mục thành công!";
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> EditCategory(string code, string name)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();
            var target = db.DanhMuc.FirstOrDefault(d => d.MaDanhMuc == code);

            if (target != null)
            {
                target.TenDanhMuc = name;
                await _dbService.SaveDatabaseAsync(db);
                TempData["SuccessMessage"] = "Cập nhật danh mục thành công!";
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> DeleteCategory(string code)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();
            var target = db.DanhMuc.FirstOrDefault(d => d.MaDanhMuc == code);

            if (target != null)
            {
                db.DanhMuc.Remove(target);
                await _dbService.SaveDatabaseAsync(db);
                TempData["SuccessMessage"] = "Đã xóa danh mục!";
            }

            return RedirectToAction("Index");
        }

        // --- MANAGING ORDERS ---


        [HttpPost]
        public async Task<IActionResult> UpdateOrderStatus(string orderCode, string status)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();
            var target = db.DonHang.FirstOrDefault(d => d.MaDonHang == orderCode);

            if (target != null)
            {
                target.TrangThai = status;
                await _dbService.SaveDatabaseAsync(db);
                TempData["SuccessMessage"] = $"Đã cập nhật trạng thái đơn hàng {orderCode} thành '{status}'!";
            }

            return RedirectToAction("Index", new { tab = "orders" });
        }
        [HttpPost]
        public async Task<IActionResult> DeleteOrder(string orderCode)
        {
            if (!IsAdminAuthenticated()) return Unauthorized();

            var db = await _dbService.GetDatabaseAsync();
            var target = db.DonHang.FirstOrDefault(d => d.MaDonHang == orderCode);

            if (target == null)
            {
                TempData["ErrorMessage"] = "Không tìm thấy đơn hàng!";
                return RedirectToAction("Index", new { tab = "orders" });
            }

            var status = target.TrangThai?.Trim().ToLower();

            // Chỉ cho xoá đơn chưa duyệt / chưa giao
            if (status == "đã duyệt" || status == "đã giao")
            {
                TempData["ErrorMessage"] = "Đơn đã thanh toán hoặc đã giao, không thể xoá khỏi dữ liệu!";
                return RedirectToAction("Index", new { tab = "orders" });
            }

            // Xoá chi tiết đơn hàng trước
            db.ChiTietDonHang.RemoveAll(c => c.MaDonHang == orderCode);

            // Xoá đơn hàng
            db.DonHang.Remove(target);

            await _dbService.SaveDatabaseAsync(db);

            TempData["SuccessMessage"] = $"Đã xoá đơn hàng {orderCode} khỏi hệ thống!";
            return RedirectToAction("Index", new { tab = "orders" });
        }
    }
}
