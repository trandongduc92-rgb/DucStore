using DucStore_MVC.Services;
using Microsoft.EntityFrameworkCore;
using DucStore_MVC.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews()
    .AddRazorRuntimeCompilation();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        options.UseSqlServer("Server=dummy;Database=dummy;Trusted_Connection=True;TrustServerCertificate=True;");
    }
});

builder.Services.AddSingleton<IDbService, DbService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (ctx.File.Name.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                using (var stream = ctx.File.CreateReadStream())
                using (var reader = new System.IO.StreamReader(stream))
                {
                    char[] buffer = new char[100];
                    int readBytes = reader.ReadBlock(buffer, 0, 100);
                    string header = new string(buffer, 0, readBytes).Trim();

                    if (header.StartsWith("<svg", StringComparison.OrdinalIgnoreCase) ||
                        header.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase) ||
                        header.Contains("xmlns=\"http://www.w3.org/2000/svg\""))
                    {
                        ctx.Context.Response.ContentType = "image/svg+xml";
                    }
                }
            }
            catch
            {
            }
        }
    }
});

app.UseRouting();

app.UseSession();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();