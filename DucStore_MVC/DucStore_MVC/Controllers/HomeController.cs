using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using DucStore_MVC.Services;
using DucStore_MVC.Models;
using System.Text.Json;

namespace DucStore_MVC.Controllers;

public class HomeController : Controller
{
    private readonly IDbService _dbService;

    public HomeController(IDbService dbService)
    {
        _dbService = dbService;
    }

    public async Task<IActionResult> Index(string? category, string? search)
    {
        var db = await _dbService.GetDatabaseAsync();
        
        // Filter products
        var products = db.SanPham;
        if (!string.IsNullOrEmpty(category))
        {
            products = products.Where(p => p.MaDanhMuc.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
        }
        if (!string.IsNullOrEmpty(search))
        {
            products = products.Where(p => p.TenSanPham.Contains(search, StringComparison.OrdinalIgnoreCase) || p.MoTa.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        ViewBag.Categories = db.DanhMuc;
        ViewBag.SelectedCategory = category;
        ViewBag.SearchQuery = search;

        // Ensure we load the user from session to header
        var customerJson = HttpContext.Session.GetString("Customer");
        if (customerJson != null)
        {
            ViewBag.CurrentUser = JsonSerializer.Deserialize<KhachHang>(customerJson);
        }

        var adminJson = HttpContext.Session.GetString("Admin");
        if (adminJson != null)
        {
            ViewBag.CurrentAdmin = JsonSerializer.Deserialize<TaiKhoanAdmin>(adminJson);
        }

        return View(products);
    }

    public async Task<IActionResult> Detail(string id)
    {
        var db = await _dbService.GetDatabaseAsync();
        var product = db.SanPham.FirstOrDefault(p => p.MaSanPham == id);
        if (product == null)
        {
            return NotFound();
        }

        // Get related products
        ViewBag.RelatedProducts = db.SanPham.Where(p => p.MaDanhMuc == product.MaDanhMuc && p.MaSanPham != product.MaSanPham).Take(4).ToList();

        // Check login session
        var customerJson = HttpContext.Session.GetString("Customer");
        if (customerJson != null)
        {
            ViewBag.CurrentUser = JsonSerializer.Deserialize<KhachHang>(customerJson);
        }

        return View(product);
    }
}
