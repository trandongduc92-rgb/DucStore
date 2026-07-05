using DucStore_MVC.Services;
using Microsoft.EntityFrameworkCore;
using DucStore_MVC.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddRazorRuntimeCompilation(); // Allows template changes in real-time

// Add session support
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Configure context accessor for session inside helper wrappers if needed
builder.Services.AddHttpContextAccessor();

// Register WebApplication DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        // Use SqlServer with dummy credentials to satisfy registration 
        // without raising database connectivity error in non-SQLServer environment
        options.UseSqlServer("Server=dummy;Database=dummy;Trusted_Connection=True;TrustServerCertificate=True;");
    }
});

// Register the custom JSON Database service with SqlServer Sync Support
builder.Services.AddSingleton<IDbService, DbService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // If it is one of our mockup image files containing SVG tags, force Content-Type to image/svg+xml
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
                // Fall back gracefully to default behavior if reading fails
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
