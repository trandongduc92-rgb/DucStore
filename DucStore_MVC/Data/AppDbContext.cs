using Microsoft.EntityFrameworkCore;
using DucStore_MVC.Models;

namespace DucStore_MVC.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<DanhMuc> DanhMuc { get; set; } = null!;
        public DbSet<SanPham> SanPham { get; set; } = null!;
        public DbSet<KhachHang> KhachHang { get; set; } = null!;
        public DbSet<DonHang> DonHang { get; set; } = null!;
        public DbSet<ChiTietDonHang> ChiTietDonHang { get; set; } = null!;
        public DbSet<TaiKhoanAdmin> TaiKhoanAdmin { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<DanhMuc>().HasKey(d => d.MaDanhMuc);
            modelBuilder.Entity<SanPham>().HasKey(s => s.MaSanPham);
            modelBuilder.Entity<KhachHang>().HasKey(k => k.MaKhachHang);
            modelBuilder.Entity<DonHang>().HasKey(d => d.MaDonHang);
            modelBuilder.Entity<ChiTietDonHang>().HasKey(c => c.MaChiTiet);
            modelBuilder.Entity<TaiKhoanAdmin>().HasKey(a => a.TenDangNhap);

            modelBuilder.Entity<SanPham>()
                .HasOne<DanhMuc>()
                .WithMany()
                .HasForeignKey(s => s.MaDanhMuc);

            modelBuilder.Entity<DonHang>()
                .HasOne<KhachHang>()
                .WithMany()
                .HasForeignKey(d => d.MaKhachHang)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ChiTietDonHang>()
                .HasOne<DonHang>()
                .WithMany()
                .HasForeignKey(c => c.MaDonHang)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChiTietDonHang>()
                .HasOne<SanPham>()
                .WithMany()
                .HasForeignKey(c => c.MaSanPham);
        }
    }
}