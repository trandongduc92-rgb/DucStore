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

        private string CreateGuestCustomer(FullDatabase db, string name, string phone, string address)
        {
            string guestId = "kh-" + Guid.NewGuid().ToString("N").Substring(0, 8);

            db.KhachHang.Add(new KhachHang
            {
                MaKhachHang = guestId,
                TenKhachHang = string.IsNullOrWhiteSpace(name) ? "Khách vãng lai" : name.Trim(),
                Email = $"guest-{guestId}@ducstore.local",
                MatKhau = "guest",
                DienThoai = phone ?? string.Empty,
                DiaChi = address ?? string.Empty
            });

            return guestId;
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart(string productCode, int quantity = 1, string dungLuong = "128GB", decimal giaDaChon = 0)
        {
            var db = await _dbService.GetDatabaseAsync();
            var product = db.SanPham.FirstOrDefault(p => p.MaSanPham == productCode);

            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại!");
            }

            dungLuong = string.IsNullOrWhiteSpace(dungLuong) ? "128GB" : dungLuong.Trim();

            if (giaDaChon <= 0)
            {
                giaDaChon = product.Gia;
            }

            var cart = GetCartFromSession();

            var existingItem = cart.FirstOrDefault(i =>
                i.SanPham.MaSanPham == productCode &&
                i.DungLuong.Equals(dungLuong, StringComparison.OrdinalIgnoreCase));

            if (existingItem != null)
            {
                existingItem.SoLuong += quantity;
                existingItem.GiaDaChon = giaDaChon;
            }
            else
            {
                cart.Add(new CartItem
                {
                    SanPham = product,
                    SoLuong = quantity,
                    DungLuong = dungLuong,
                    GiaDaChon = giaDaChon
                });
            }

            SaveCartToSession(cart);

            TempData["SuccessMessage"] = $"Đã thêm {product.TenSanPham} {dungLuong} vào giỏ hàng!";
            return RedirectToAction("Index", "Home", new { openCart = "true" });
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
            return RedirectToAction("Index", "Home", new { openCart = "true" });
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
            return RedirectToAction("Index", "Home", new { openCart = "true" });
        }

        [HttpPost]
        public async Task<IActionResult> Checkout(string name, string phone, string address, string paymentMethod = "bank_transfer")
        {
            var cart = GetCartFromSession();

            if (cart.Count == 0)
            {
                TempData["ErrorMessage"] = "Giỏ hàng đang trống!";
                return RedirectToAction("Index", "Home");
            }

            var db = await _dbService.GetDatabaseAsync();

            var customerJson = HttpContext.Session.GetString("Customer");
            string customerId;

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
                else
                {
                    customerId = CreateGuestCustomer(db, name, phone, address);
                }
            }
            else
            {
                customerId = CreateGuestCustomer(db, name, phone, address);
            }

            bool isStorePickup = paymentMethod == "store_pickup";

            string deliveryInfo = isStorePickup
                ? "Nhận tại cửa hàng - DucStore Premium Hub, 123 Nguyễn Văn Cừ, Q.5, TP.HCM"
                : address;

            decimal totalAmount = cart.Sum(i => i.ThanhTien);
            string orderCode = "dh-" + Guid.NewGuid().ToString("N").Substring(0, 8);

            var order = new DonHang
            {
                MaDonHang = orderCode,
                MaKhachHang = customerId,
                TenKhachHang = string.IsNullOrWhiteSpace(name) ? "Khách vãng lai" : name,
                NgayDat = DateTime.Now,
                TongTien = totalAmount,
                TrangThai = "Chờ duyệt",
                DiaChiGiaoHang = deliveryInfo,
                HinhThucThanhToan = isStorePickup ? "Nhận tại cửa hàng" : "Chuyển khoản"
            };

            db.DonHang.Add(order);

            foreach (var item in cart)
            {
                db.ChiTietDonHang.Add(new ChiTietDonHang
                {
                    MaChiTiet = "ct-" + Guid.NewGuid().ToString("N").Substring(0, 8),
                    MaDonHang = orderCode,
                    MaSanPham = item.SanPham.MaSanPham,
                    SoLuong = item.SoLuong,
                    DonGia = item.GiaDaChon
                });
            }

            await _dbService.SaveDatabaseAsync(db);

            HttpContext.Session.Remove(CART_SESSION_KEY);

            return RedirectToAction("OrderSuccess", "Cart", new { orderCode = orderCode });
        }
        [HttpGet]
        public async Task<IActionResult> OrderSuccess(string orderCode)
        {
            var db = await _dbService.GetDatabaseAsync();

            var order = db.DonHang.FirstOrDefault(d => d.MaDonHang == orderCode);
            if (order == null)
            {
                return RedirectToAction("Index", "Home");
            }

            return View(order);
        }

        [HttpPost]
        public async Task<IActionResult> ConfirmTransfer(string orderCode)
        {
            var db = await _dbService.GetDatabaseAsync();

            var order = db.DonHang.FirstOrDefault(d => d.MaDonHang == orderCode);
            if (order != null && order.TrangThai == "Chờ duyệt")
            {
                order.TrangThai = "Chờ xác nhận thanh toán";
                await _dbService.SaveDatabaseAsync(db);

                TempData["SuccessMessage"] = "Đã gửi thông báo chuyển khoản cho Admin. Vui lòng chờ xác nhận.";
            }

            return RedirectToAction("OrderSuccess", "Cart", new { orderCode = orderCode });
        }
    }

}