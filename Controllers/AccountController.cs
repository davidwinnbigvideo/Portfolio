using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Portfolio.Models;

namespace Portfolio.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == model.Username);

                if (user != null && VerifyPassword(model.Password, user.PasswordHash))
                {
                    // Store user ID and username in session
                    HttpContext.Session.SetInt32("UserId", user.Id);
                    HttpContext.Session.SetString("Username", user.Username);
                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError(string.Empty, "Invalid username or password");
            }

            return View(model);
        }

        [HttpPost]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == model.Username))
                {
                    ModelState.AddModelError("Username", "Username already exists");
                    return View(model);
                }

                var user = new User
                {
                    Username = model.Username,
                    PasswordHash = HashPassword(model.Password)
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Automatically log in the user
                HttpContext.Session.SetInt32("UserId", user.Id);
                HttpContext.Session.SetString("Username", user.Username);
                return RedirectToAction("Index", "Home");
            }

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Profile()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return RedirectToAction("Login");
            }

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound();
            }

            var viewModel = new ProfileViewModel
            {
                Id = user.Id,
                Username = user.Username
            };

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile(ProfileViewModel model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return RedirectToAction("Login");
            }

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                // If username is being changed
                if (user.Username != model.Username)
                {
                    // Check if new username is already taken
                    if (await _context.Users.AnyAsync(u => u.Username == model.Username && u.Id != userId))
                    {
                        ModelState.AddModelError("Username", "Username already exists");
                        return View("Profile", model);
                    }
                    user.Username = model.Username;
                    HttpContext.Session.SetString("Username", model.Username);
                }

                // If password is being changed
                if (!string.IsNullOrEmpty(model.CurrentPassword) && !string.IsNullOrEmpty(model.NewPassword))
                {
                    if (!VerifyPassword(model.CurrentPassword, user.PasswordHash))
                    {
                        ModelState.AddModelError("CurrentPassword", "Current password is incorrect");
                        return View("Profile", model);
                    }
                    user.PasswordHash = HashPassword(model.NewPassword);
                }

                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "Profile updated successfully";
                return RedirectToAction("Profile");
            }

            return View("Profile", model);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue)
            {
                return RedirectToAction("Login");
            }

            var user = await _context.Users.FindAsync(userId.Value);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                HttpContext.Session.Clear();
            }

            return RedirectToAction("Index", "Home");
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
