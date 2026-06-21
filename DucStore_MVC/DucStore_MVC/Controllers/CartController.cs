using Microsoft.AspNetCore.Mvc;
using DucStore_MVC.Services;
using DucStore_MVC.Models;
using System.Text.Json;

namespace DucStore_MVC.Controllers
{
    public class CartController : Controller
    {
        private readonly IDbService _dbService;
        private const string CART_SESSION_KEY = "Cart";

        public CartController(IDbService dbService)
        {
            _dbService = dbService;
        }

        private List<CartItem> GetCartFromSession()
        {
            var cartJson = HttpContext.Session.GetString(CART_SESSION_KEY);
            if (cartJson == null)
            {
                return new List<CartItem>();
            }
            return JsonSerializer.Deserialize<List<CartItem>>(cartJson) ?? new List<CartItem>();
        }

        private void SaveCartToSession(List<CartItem> cart)
        {
            HttpContext.Session.SetString(CART_SESSION_KEY, JsonSerializer.Serialize(cart));
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart(string productCode, int quantity = 1)
        {
            var db = await _dbService.GetDatabaseAsync();
            var product = db.SanPham.FirstOrDefault(p => p.MaSanPham == productCode);

            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại!");
            }

            var cart = GetCartFromSession();
            var existingItem = cart.FirstOrDefault(i => i.SanPham.MaSanPham == productCode);

            if (existingItem != null)
            {
                existingItem.SoLuong += quantity;
            }
            else
            {
                cart.Add(new CartItem { SanPham = product, SoLuong = quantity });
            }

            SaveCartToSession(cart);
            TempData["SuccessMessage"] = $"Đã thêm {product.TenSanPham} vào giỏ hàng!";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public IActionResult UpdateQuantity(string productCode, int quantity)
        {
            var cart = GetCartFromSession();
            var existingItem = cart.FirstOrDefault(i => i.SanPham.MaSanPham == productCode);

            if (existingItem != null)
            {
                if (quantity <= 0)
                {
                    cart.Remove(existingItem);
                }
                else
                {
                    existingItem.SoLuong = quantity;
                }
            }

            SaveCartToSession(cart);
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public IActionResult RemoveFromCart(string productCode)
        {
            var cart = GetCartFromSession();
            var existingItem = cart.FirstOrDefault(i => i.SanPham.MaSanPham == productCode);

            if (existingItem != null)
            {
                cart.Remove(existingItem);
            }

            SaveCartToSession(cart);
            TempData["SuccessMessage"] = "Đã xóa sản phẩm khỏi giỏ hàng!";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> Checkout(string name, string phone, string address)
        {
            var cart = GetCartFromSession();
            if (cart.Count == 0)
            {
                TempData["ErrorMessage"] = "Giỏ hàng đang trống!";
                return RedirectToAction("Index", "Home");
            }

            var db = await _dbService.GetDatabaseAsync();

            // Try to find if user is logged in
            var customerJson = HttpContext.Session.GetString("Customer");
            string customerId = "kh-guest";
            
            if (customerJson != null)
            {
                var customer = JsonSerializer.Deserialize<KhachHang>(customerJson);
                if (customer != null)
                {
                    customerId = customer.MaKhachHang;
                    name = customer.TenKhachHang;
                    phone = customer.DienThoai;
                    address = customer.DiaChi;
                }
            }

            decimal totalAmount = cart.Sum(i => i.ThanhTien);
            string orderCode = "dh-" + Guid.NewGuid().ToString().Substring(0, 8);

            // Create Order
            var order = new DonHang
            {
                MaDonHang = orderCode,
                MaKhachHang = customerId,
                TenKhachHang = name,
                NgayDat = DateTime.Now,
                TongTien = totalAmount,
                TrangThai = "Chờ duyệt",
                DiaChiGiaoHang = address
            };

            db.DonHang.Add(order);

            // Create Order Details
            foreach (var item in cart)
            {
                db.ChiTietDonHang.Add(new ChiTietDonHang
                {
                    MaChiTiet = "ct-" + Guid.NewGuid().ToString().Substring(0, 8),
                    MaDonHang = orderCode,
                    MaSanPham = item.SanPham.MaSanPham,
                    SoLuong = item.SoLuong,
                    DonGia = item.SanPham.Gia
                });
            }

            await _dbService.SaveDatabaseAsync(db);

            // Clear Cart
            HttpContext.Session.Remove(CART_SESSION_KEY);

            TempData["SuccessMessage"] = $"Đặt hàng thành công! Mã đơn của bạn là: {orderCode}. Chúng tôi sẽ liên hệ sớm nhất.";
            return RedirectToAction("Index", "Home");
        }
    }
}
