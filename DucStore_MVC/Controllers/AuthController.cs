using Microsoft.AspNetCore.Mvc;
using DucStore_MVC.Services;
using DucStore_MVC.Models;
using System.Text.Json;

namespace DucStore_MVC.Controllers
{
    public class AuthController : Controller
    {
        private readonly IDbService _dbService;

        public AuthController(IDbService dbService)
        {
            _dbService = dbService;
        }

        [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {
            var db = await _dbService.GetDatabaseAsync();
            var customer = db.KhachHang.FirstOrDefault(k => k.Email == email && k.MatKhau == password);

            if (customer != null)
            {
                HttpContext.Session.SetString("Customer", JsonSerializer.Serialize(customer));
                TempData["SuccessMessage"] = $"Chào mừng {customer.TenKhachHang} đã quay trở lại!";
                return RedirectToAction("Index", "Home");
            }

            TempData["ErrorMessage"] = "Email hoặc Mật khẩu khách hàng không đúng!";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> Register(string name, string email, string password, string phone, string address)
        {
            var db = await _dbService.GetDatabaseAsync();

            if (db.KhachHang.Any(k => k.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
            {
                TempData["ErrorMessage"] = "Email này đã được đăng ký tài khoản!";
                return RedirectToAction("Index", "Home");
            }

            var newCust = new KhachHang
            {
                MaKhachHang = "kh-" + Guid.NewGuid().ToString().Substring(0, 8),
                TenKhachHang = name,
                Email = email,
                MatKhau = password,
                DienThoai = phone,
                DiaChi = address,
                NgayTao = DateTime.Now
            };

            db.KhachHang.Add(newCust);
            await _dbService.SaveDatabaseAsync(db);

            HttpContext.Session.SetString("Customer", JsonSerializer.Serialize(newCust));
            TempData["SuccessMessage"] = "Đăng ký tài khoản thành công! Bạn đã tự động đăng nhập.";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> AdminLogin(string adminUsername, string adminPassword)
        {
            var db = await _dbService.GetDatabaseAsync();
            var admin = db.TaiKhoanAdmin.FirstOrDefault(a => a.TenDangNhap == adminUsername && a.MatKhau == adminPassword);

            if (admin != null)
            {
                HttpContext.Session.SetString("Admin", JsonSerializer.Serialize(admin));
                TempData["SuccessMessage"] = "Đăng nhập quyền Quản trị viên (Admin) thành công!";
                return RedirectToAction("Index", "Admin");
            }

            TempData["ErrorMessage"] = "Tài khoản hoặc Mật khẩu Admin không chính xác!";
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("Customer");
            HttpContext.Session.Remove("Admin");
            TempData["SuccessMessage"] = "Đã đăng xuất tài khoản thành công!";
            return RedirectToAction("Index", "Home");
        }
    }
}