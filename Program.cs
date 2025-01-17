using Microsoft.EntityFrameworkCore;
using Portfolio.Models;
using DotNetEnv;

// Load environment variables
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Build the connection string from environment variables
var server = Environment.GetEnvironmentVariable("RDS_HOSTNAME");
var port = Environment.GetEnvironmentVariable("RDS_PORT");
var database = Environment.GetEnvironmentVariable("RDS_DB_NAME");
var username = Environment.GetEnvironmentVariable("RDS_USERNAME");
var password = Environment.GetEnvironmentVariable("RDS_PASSWORD");

var connectionString = $"Server={server};Port={port};Database={database};User={username};Password={password};";
Console.WriteLine("derp");
Console.WriteLine($"Server: {server}");
Console.WriteLine($"Port: {port}");
Console.WriteLine($"Database: {database}");
Console.WriteLine($"Username: {username}");
Console.WriteLine($"Password is set: {!string.IsNullOrEmpty(password)}");
// Add MySQL database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));

// Add session support
builder.Services.AddSession();

var app = builder.Build();

// Configure middleware
app.UseSession();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();